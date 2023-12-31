import { useEffect, useState } from "react";
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
  onChange: (rule: Rule) => void,
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

  useEffect(() => {
    // For incomplete data, enter edit mode.
    ruleValidator.validate(rule).then(({ valid }) => {
      if (!valid) {
        setIsEditing(true);
      }
      setIsValid(valid);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function save() {
    setIsEditing(false);
    onChange(rule);
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
    const result = await ruleValidator.validate(newRule);
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
