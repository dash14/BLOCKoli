import { useEffect, useRef, useState } from "react";
import cloneDeep from "lodash-es/cloneDeep";
import isEqual from "lodash-es/isEqual";
import { createRegexValidator } from "@/modules/chrome/regex";
import {
  RequestMethod,
  ResourceType,
  Rule,
  RuleActionType,
  RuleCondition,
} from "@/modules/core/rules";
import { RuleValidator } from "@/modules/rules/validation/edit";
import { SaveResult } from "./useRuleSetsEdit";

const ruleValidator = new RuleValidator(createRegexValidator());

type ValidationErrors = Required<{
  [K in keyof RuleCondition]: string[];
}>;

export function useRuleEdit(
  givenRule: Rule,
  onChange: (rule: Rule, base: Rule) => void | Promise<SaveResult>,
  onCancel: () => void,
  onRemove: () => void
) {
  // Every save brings all stored rules back as new objects; only a changed rule counts
  const latestGivenRule = useRef(givenRule);
  if (!isEqual(latestGivenRule.current, givenRule)) {
    latestGivenRule.current = givenRule;
  }
  const initialRule = latestGivenRule.current;

  const [isEditing, setIsEditing] = useState(false);
  // Edits not saved yet; until the first one, the given rule is shown
  const [draft, setDraft] = useState<Rule | undefined>(undefined);
  const rule = draft ?? initialRule;
  // The given rule when editing started, as later ones may come from another page
  const base = useRef<Rule | undefined>(undefined);
  // The draft as of the last change, for a save that finishes later
  const latestDraft = useRef<Rule | undefined>(undefined);

  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    requestDomains: [],
    initiatorDomains: [],
    urlFilter: [],
    isRegexFilter: [],
    requestMethods: [],
    resourceTypes: [],
  });

  function changeDraft(newRule: Rule | undefined) {
    if (newRule) {
      base.current ??= initialRule;
    } else {
      base.current = undefined;
    }
    latestDraft.current = newRule;
    setDraft(newRule);
  }

  // Checks await Chrome and can finish out of order; only the latest counts
  const latestValidation = useRef(0);
  // The rule that isValid was computed for
  const validatedRule = useRef<Rule>(undefined);

  async function validateLatest(target: Rule) {
    const validation = ++latestValidation.current;
    const result = await ruleValidator.validate(target);
    return validation === latestValidation.current ? result : undefined;
  }

  // A save that waited on Chrome calls the onChange of the latest render
  const latestOnChange = useRef(onChange);
  useEffect(() => {
    latestOnChange.current = onChange;
  }, [onChange]);

  // Unmounting drops a running check, so a pending save() skips onChange
  useEffect(
    () => () => {
      latestValidation.current++;
    },
    []
  );

  async function save() {
    // isValid may still be for an earlier input
    if (validatedRule.current !== rule || !isValid) {
      if (!(await validate(rule))) return;
    }
    setIsEditing(false);
    const savedFrom = base.current ?? initialRule;
    // A save started while this one waits applies on top of it
    base.current = rule;
    const result = await latestOnChange.current(rule, savedFrom);
    if (result === false || result === "conflict") {
      // The draft stays for another try. After a conflict the user has seen,
      // that try saves over the latest given rule.
      base.current = result === "conflict" ? undefined : savedFrom;
      setIsEditing(true);
    } else if (latestDraft.current === rule) {
      // Unless editing started again while the save waited
      changeDraft(undefined);
    }
  }

  function cancel() {
    setIsEditing(false);
    changeDraft(undefined);
    validate(initialRule);
    onCancel();
  }

  function remove() {
    onRemove();
  }

  function enterEditMode() {
    setIsEditing(true);
  }

  function updateAction(value: RuleActionType) {
    const newRule = cloneDeep(rule);
    newRule.action.type = value;
    changeDraft(newRule);
    validate(newRule);
  }

  function updateRequestMethods(value: RequestMethod[]) {
    const newRule = cloneDeep(rule);
    newRule.condition.requestMethods = value;
    changeDraft(newRule);
    validate(newRule);
  }

  function updateResourceTypes(value: ResourceType[]) {
    const newRule = cloneDeep(rule);
    newRule.condition.resourceTypes = value;
    changeDraft(newRule);
    validate(newRule);
  }

  async function updateUrlFilter(text: string) {
    const newRule = cloneDeep(rule);
    newRule.condition.urlFilter = text;
    changeDraft(newRule);
    validate(newRule);
  }

  function updateIsRegexFilter(checked: boolean) {
    const newRule = cloneDeep(rule);
    newRule.condition.isRegexFilter = checked;
    changeDraft(newRule);
    validate(newRule);
  }

  function updateRequestDomains(domains: string[]) {
    const newRule = cloneDeep(rule);
    newRule.condition.requestDomains = domains;
    changeDraft(newRule);
    validate(newRule);
  }

  function updateInitiatorDomains(domains: string[]) {
    const newRule = cloneDeep(rule);
    newRule.condition.initiatorDomains = domains;
    changeDraft(newRule);
    validate(newRule);
  }

  async function validate(newRule: Rule) {
    const result = await validateLatest(newRule);
    // Undefined when a newer check has started
    if (!result) return undefined;
    const errors: ValidationErrors = {
      requestDomains: [],
      initiatorDomains: [],
      urlFilter: [],
      isRegexFilter: [],
      requestMethods: [],
      resourceTypes: [],
    };
    if (!result.valid) {
      Object.keys(errors).forEach((key) => {
        const field = key as keyof ValidationErrors;
        errors[field] = result.errors
          .filter((err) => err.ruleField?.endsWith(field))
          .map((err) => err.message as string)
          .filter(Boolean);
      });
    }
    setValidationErrors(errors);
    setIsValid(result.valid);
    validatedRule.current = newRule;
    return result.valid;
  }

  useEffect(() => {
    // A draft is what is shown, and its own check stands
    if (draft) return;
    // For incomplete data, enter edit mode.
    validate(initialRule).then((valid) => {
      if (valid === false) {
        setIsEditing(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRule]);

  return {
    save,
    cancel,
    remove,
    enterEditMode,
    updateAction,
    updateRequestMethods,
    updateResourceTypes,
    updateUrlFilter,
    updateIsRegexFilter,
    updateRequestDomains,
    updateInitiatorDomains,
    isEditing,
    rule,
    isValid,
    validationErrors,
  };
}
