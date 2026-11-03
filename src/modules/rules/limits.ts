// Far below Chrome's limit, as the options page slows down with a few hundred rules open at once
export const MAX_RULES = 500;

export function countRules(ruleSets: readonly { rules: readonly unknown[] }[]) {
  return ruleSets.reduce((count, ruleSet) => count + ruleSet.rules.length, 0);
}
