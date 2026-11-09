import { ServiceBase } from "@/modules/core/service";
import { State } from "@/modules/core/state";
import { ExportedRuleSets } from "@/modules/rules/export";
import { MatchedRule } from "@/modules/rules/matched";
import {
  UnidentifiedRuleSet,
  VersionedRuleSets,
} from "@/modules/rules/stored";
import { RuleSetsValidationError } from "../rules/validation/RuleSets";

export const ServiceId = "RequestBlock";

// Codes of the ServiceErrors that reject a change to the rule sets
export const ErrorCode = {
  // The change was made on rule sets older than the stored ones
  STALE_RULE_SETS: "stale_rule_sets",
  TOO_MANY_RULES: "too_many_rules",
  TOO_MANY_CHROME_RULES: "too_many_chrome_rules",
  TOO_MANY_REGEX_RULES: "too_many_regex_rules",
} as const;

export type Events = {
  changeState: State;
  updateRuleSets: VersionedRuleSets;
};

export interface Service extends ServiceBase<Events> {
  enable(): Promise<void>;
  disable(): Promise<void>;
  isEnabled(): Promise<boolean>;
  getRuleSets(): Promise<VersionedRuleSets>;
  // With baseRevision, saves only if the stored rule sets are still at that revision
  updateRuleSets(
    ruleSets: UnidentifiedRuleSet[],
    baseRevision?: number
  ): Promise<VersionedRuleSets>;
  getMatchedRules(): Promise<MatchedRule[]>;
  getLanguage(): Promise<string>;
  setLanguage(lang: string): Promise<void>;
  export(): Promise<ExportedRuleSets>;
  import(object: unknown): Promise<[boolean, RuleSetsValidationError[]]>;
}
