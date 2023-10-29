import { ServiceBase } from "@/modules/core/service";
import { State } from "@/modules/core/state";
import { ExportedRuleSets } from "@/modules/rules/export";
import { MatchedRule } from "@/modules/rules/matched";
import { StoredRuleSets } from "@/modules/rules/stored";
import { RuleSetsValidationError } from "../rules/validation/RuleSets";

export const ServiceId = "RequestBlock";

export type Events = {
  changeState: State;
  updateRuleSets: StoredRuleSets;
};

export interface Service extends ServiceBase<Events> {
  enable(): Promise<void>;
  disable(): Promise<void>;
  isEnabled(): Promise<boolean>;
  getRuleSets(): Promise<StoredRuleSets>;
  updateRuleSets(ruleSets: StoredRuleSets): Promise<StoredRuleSets>;
  getMatchedRules(): Promise<MatchedRule[]>;
  getLanguage(): Promise<string>;
  setLanguage(lang: string): Promise<void>;
  export(): Promise<ExportedRuleSets>;
  import(object: object): Promise<[boolean, RuleSetsValidationError[]]>;
}
