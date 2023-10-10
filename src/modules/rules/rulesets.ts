import { RuleSet } from "@/modules/core/rules";
import {
  RULE_ID_EDITING,
  RULE_ID_UNSAVED,
  StoredRule,
  StoredRuleSets,
} from "./stored";

export function toRuleList(ruleSets: StoredRuleSets): StoredRule[] {
  const rules: StoredRule[] = [];
  walkRules(ruleSets, (rule) => rules.push(rule));
  return rules;
}

export function walkRules(
  ruleSets: StoredRuleSets,
  walker: (rule: StoredRule, index: number, ruleSet: RuleSet) => void
): void {
  ruleSets.forEach((ruleSet) => {
    ruleSet.rules.forEach((rule, i) => {
      if (rule.id !== RULE_ID_UNSAVED && rule.id !== RULE_ID_EDITING) {
        walker(rule, i, ruleSet);
      }
    });
  });
}
