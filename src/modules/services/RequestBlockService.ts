import { MatchedRule, RuleSets } from "@/modules/core/rules";
import { ServiceBase } from "@/modules/core/service";
import { State } from "@/modules/core/state";

export const ServiceId = "RequestBlock";

export type Events = {
  changeState: State;
  updateRuleSets: RuleSets;
};

export interface Service extends ServiceBase<Events> {
  enable(): Promise<void>;
  disable(): Promise<void>;
  isEnabled(): Promise<boolean>;
  getRuleSets(): Promise<RuleSets>;
  updateRuleSets(ruleSets: RuleSets): Promise<RuleSets>;
  getMatchedRules(): Promise<MatchedRule[]>;
}
