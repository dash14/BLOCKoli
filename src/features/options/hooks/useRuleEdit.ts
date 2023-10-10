import { useEffect, useState } from "react";
import cloneDeep from "lodash-es/cloneDeep";
import { createRegexValidator } from "@/modules/chrome/regex";
import {
  RequestMethod,
  ResourceType,
  Rule,
  RuleActionType,
} from "@/modules/core/rules";
import { RuleValidator } from "@/modules/rules/validation/edit";

const ruleValidator = new RuleValidator(createRegexValidator());

export function useRuleEdit(
  initialRule: Rule,
  onChange: (rule: Rule) => void,
  onCancel: () => void,
  onRemove: () => void
) {
  const [isEditing, setIsEditing] = useState(false);
  const [rule, setRuleObject] = useState(initialRule);
  const [requestDomainsText, setRequestDomainsText] = useState(
    rule.condition.requestDomains?.join(",") ?? ""
  );
  const [initiatorDomainsText, setInitiatorDomainsText] = useState(
    rule.condition.initiatorDomains?.join(",") ?? ""
  );
  const [isValid, setIsValid] = useState(false);
  const [regexInvalidReason, setRegexInvalidReason] = useState("");

  useEffect(() => {
    // For incomplete data, enter edit mode.
    ruleValidator.validate(rule).then(({ isValid }) => {
      if (!isValid) {
        setIsEditing(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function save() {
    setIsEditing(false);
    onChange(rule);
  }

  function cancel() {
    setIsEditing(false);
    setRuleObject(initialRule);
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

  function updateRequestMethods(value: string[]) {
    const newRule = cloneDeep(rule);
    newRule.condition.requestMethods = value as RequestMethod[];
    setRuleObject(newRule);
    validate(newRule);
  }

  function updateResourceTypes(value: string[]) {
    const newRule = cloneDeep(rule);
    newRule.condition.resourceTypes = value as ResourceType[];
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

  function updateRequestDomains(text: string) {
    setRequestDomainsText(text);
    const domains = text
      .split(",")
      .map((text) => text.trim())
      .filter(Boolean);

    const newRule = cloneDeep(rule);
    newRule.condition.requestDomains = domains;
    setRuleObject(newRule);
    validate(newRule);
  }

  function updateInitiatorDomains(text: string) {
    setInitiatorDomainsText(text);
    const domains = text
      .split(",")
      .map((text) => text.trim())
      .filter(Boolean);

    const newRule = cloneDeep(rule);
    newRule.condition.initiatorDomains = domains;
    setRuleObject(newRule);
    validate(newRule);
  }

  async function validate(newRule: Rule) {
    const result = await ruleValidator.validate(newRule);
    if (result.isValid) {
      setRegexInvalidReason("");
      setIsValid(true);
    } else {
      if (result.reason?.isInvalidUrlFilter) {
        setRegexInvalidReason(result.reason?.urlFilterReason ?? "");
      }
      setIsValid(false);
    }
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
    requestDomainsText,
    initiatorDomainsText,
    isValid,
    regexInvalidReason,
  };
}
