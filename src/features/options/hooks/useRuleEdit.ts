import { useEffect, useRef, useState } from "react";
import cloneDeep from "lodash-es/cloneDeep";
import { createRegexValidator } from "@/modules/chrome/regex";
import {
  RequestMethod,
  ResourceType,
  Rule,
  RuleActionType,
  RuleCondition,
} from "@/modules/core/rules";
import { RuleValidator } from "@/modules/rules/validation/edit";

const ruleValidator = new RuleValidator(createRegexValidator());

type ValidationErrors = Required<{
  [K in keyof RuleCondition]: string[];
}>;

export function useRuleEdit(
  initialRule: Rule,
  // Resolves to false when the save was rejected
  onChange: (rule: Rule) => void | Promise<boolean>,
  onCancel: () => void,
  onRemove: () => void
) {
  const [isEditing, setIsEditing] = useState(false);
  const [rule, setRuleObject] = useState(initialRule);
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    requestDomains: [],
    initiatorDomains: [],
    urlFilter: [],
    isRegexFilter: [],
    requestMethods: [],
    resourceTypes: [],
  });

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

  // What a rejected save sent, kept in the editor when the page goes back to the stored rule
  const rejectedRule = useRef<Rule>(undefined);

  useEffect(() => {
    const next = rejectedRule.current ?? initialRule;
    setRuleObject(next);
    // For incomplete data, enter edit mode.
    validate(next).then((valid) => {
      if (valid === false) {
        setIsEditing(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRule]);

  // Only the render right after a rejected save keeps it
  useEffect(() => {
    rejectedRule.current = undefined;
  });

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
    if ((await latestOnChange.current(rule)) === false) {
      rejectedRule.current = rule;
      setRuleObject(rule);
      validate(rule);
      return;
    }
    setIsEditing(false);
  }

  function cancel() {
    setIsEditing(false);
    resetRuleObject();
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
    setRuleObject(newRule);
    validate(newRule);
  }

  function updateRequestMethods(value: RequestMethod[]) {
    const newRule = cloneDeep(rule);
    newRule.condition.requestMethods = value;
    setRuleObject(newRule);
    validate(newRule);
  }

  function updateResourceTypes(value: ResourceType[]) {
    const newRule = cloneDeep(rule);
    newRule.condition.resourceTypes = value;
    setRuleObject(newRule);
    validate(newRule);
  }

  async function updateUrlFilter(text: string) {
    const newRule = cloneDeep(rule);
    newRule.condition.urlFilter = text;
    setRuleObject(newRule);
    validate(newRule);
  }

  function updateIsRegexFilter(checked: boolean) {
    const newRule = cloneDeep(rule);
    newRule.condition.isRegexFilter = checked;
    setRuleObject(newRule);
    validate(newRule);
  }

  function updateRequestDomains(domains: string[]) {
    const newRule = cloneDeep(rule);
    newRule.condition.requestDomains = domains;
    setRuleObject(newRule);
    validate(newRule);
  }

  function updateInitiatorDomains(domains: string[]) {
    const newRule = cloneDeep(rule);
    newRule.condition.initiatorDomains = domains;
    setRuleObject(newRule);
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

  function resetRuleObject() {
    const rule = initialRule;
    setRuleObject(rule);
    validate(rule);
  }

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
