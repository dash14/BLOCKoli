import { ServiceBase } from "@/modules/core/service";
import { State } from "@/modules/core/state";
import { MatchedRule } from "@/modules/rules/matched";
import { StoredRuleSets } from "../rules/stored";

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
}
