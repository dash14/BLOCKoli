import { useEffect, useState } from "react";
import cloneDeep from "lodash-es/cloneDeep";
import { push, removeAt, replaceAt } from "@/modules/core/array";
import { Rule } from "@/modules/core/rules";
import {
  RULE_ID_EDITING,
  RULE_ID_UNSAVED,
  StoredRule,
} from "@/modules/rules/stored";
import { newRuleTemplate } from "@/modules/rules/template";

export function useRulesEdit(
  rules: StoredRule[],
  onChange: (rules: StoredRule[]) => void
) {
  const [isAllowAdd, setIsAllowAdd] = useState(true);

  useEffect(() => {
    setIsAllowAdd(rules.filter((r) => r.id === RULE_ID_EDITING).length === 0);
  }, [rules]);

  function addRule() {
    onChange(push(rules, cloneDeep(newRuleTemplate)));
  }

  function updateRule(rule: Rule, index: number) {
    const updated = rule as StoredRule;
    if (updated.id === RULE_ID_EDITING) {
      updated.id = RULE_ID_UNSAVED;
    }
    const newRules = replaceAt(rules, index, updated);
    onChange(newRules);
  }

  function removeRule(index: number) {
    const rule = rules[index];
    if (rule.id === RULE_ID_EDITING) {
      cancelEdit(index);
    } else {
      const newRules = removeAt(rules, index);
      onChange(newRules);
    }
  }

  function cancelEdit(index: number) {
    if (rules[index].id === RULE_ID_EDITING) {
      // cancel new rule
      const newRules = removeAt(rules, index);
      onChange(newRules);
    }
  }

  return {
    isAllowAdd,
    addRule,
    updateRule,
    removeRule,
    cancelEdit,
  };
}
