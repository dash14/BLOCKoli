import { Rule } from "@/modules/core/rules";

export const RULE_ID_EDITING = -1;
export const RULE_ID_UNSAVED = 0;

export interface StoredRule extends Rule {
  id: number;
}

export type StoredRules = StoredRule[];

export interface StoredRuleSet {
  name: string;
  rules: StoredRules;
}

export type StoredRuleSets = StoredRuleSet[];

// Rule sets with the revision they were saved at, so pages can tell newer from older
export interface VersionedRuleSets {
  revision: number;
  ruleSets: StoredRuleSets;
}
