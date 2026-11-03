// Far below Chrome's limit: the options page renders every rule and slows down past a few hundred
export const MAX_RULES = 500;

export function countRules(ruleSets: readonly { rules: readonly unknown[] }[]) {
  return ruleSets.reduce((count, ruleSet) => count + ruleSet.rules.length, 0);
}
