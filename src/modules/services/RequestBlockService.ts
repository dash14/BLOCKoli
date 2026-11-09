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

// Rejects an update made on rule sets older than the stored ones
export const STALE_RULE_SETS_ERROR = "The rule sets were changed on another page";

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
