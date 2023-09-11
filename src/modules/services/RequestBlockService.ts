import { ServiceBase } from "@/modules/core/service";
import { State } from "@/modules/core/state";
import { RuleSets } from "@/modules/core/rules";

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
}
