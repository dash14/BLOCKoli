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

export type Events = {
  changeState: State;
  updateRuleSets: VersionedRuleSets;
};

export interface Service extends ServiceBase<Events> {
  enable(): Promise<void>;
  disable(): Promise<void>;
  isEnabled(): Promise<boolean>;
  getRuleSets(): Promise<VersionedRuleSets>;
  updateRuleSets(ruleSets: UnidentifiedRuleSet[]): Promise<VersionedRuleSets>;
  getMatchedRules(): Promise<MatchedRule[]>;
  getLanguage(): Promise<string>;
  setLanguage(lang: string): Promise<void>;
  export(): Promise<ExportedRuleSets>;
  import(object: unknown): Promise<[boolean, RuleSetsValidationError[]]>;
}
