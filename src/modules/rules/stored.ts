import { Rule } from "@/modules/core/rules";

// The ID of a rule sent before the service has given it one
export const RULE_ID_UNSAVED = 0;

export interface StoredRule extends Rule {
  id: number;
}

export type StoredRules = StoredRule[];

export interface StoredRuleSet {
  // Stays the same when the rule set is renamed, edited or moved
  id: string;
  name: string;
  rules: StoredRules;
}

export type StoredRuleSets = StoredRuleSet[];

// Stored before rule sets had IDs, or sent by a page without one
export type UnidentifiedRuleSet = Omit<StoredRuleSet, "id"> & { id?: unknown };

// New IDs for rule sets without one, or with the ID of an earlier one
export function assignRuleSetIds(
  ruleSets: readonly UnidentifiedRuleSet[]
): StoredRuleSets {
  const used = new Set<string>();
  return ruleSets.map((ruleSet) => {
    const { id } = ruleSet;
    if (typeof id === "string" && id !== "" && !used.has(id)) {
      used.add(id);
      return { ...ruleSet, id };
    }
    const newId = crypto.randomUUID();
    used.add(newId);
    return { ...ruleSet, id: newId };
  });
}

// Rule sets with the revision they were saved at, so pages can tell newer from older
export interface VersionedRuleSets {
  revision: number;
  ruleSets: StoredRuleSets;
}
