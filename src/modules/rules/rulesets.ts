import {
  RULE_ID_EDITING,
  RULE_ID_UNSAVED,
  RuleSet,
  RuleSets,
  RuleWithId,
} from "@/modules/core/rules";

export function toRuleMap(ruleSets: RuleSets): Map<number, RuleWithId> {
  const rules = new Map<number, RuleWithId>();
  walkRules(ruleSets, (rule) => rules.set(rule.id, rule));
  return rules;
}

export function toRuleIdSet(ruleSets: RuleSets): Set<number> {
  const ids = new Set<number>();
  walkRules(ruleSets, (rule) => ids.add(rule.id));
  return ids;
}

export function toRuleList(ruleSets: RuleSets): RuleWithId[] {
  const rules: RuleWithId[] = [];
  walkRules(ruleSets, (rule) => rules.push(rule));
  return rules;
}

export function walkRules(
  ruleSets: RuleSets,
  walker: (rule: RuleWithId, index: number, ruleSet: RuleSet) => void
): void {
  ruleSets.forEach((ruleSet) => {
    ruleSet.rules.forEach((rule, i) => {
      if (rule.id !== RULE_ID_UNSAVED && rule.id !== RULE_ID_EDITING) {
        walker(rule, i, ruleSet);
      }
    });
  });
}
