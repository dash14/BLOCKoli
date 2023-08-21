import { ServiceBase } from "@/modules/core/service";
import { State } from "@/modules/core/state";
import { Rules } from "@/modules/core/rules";

export const ServiceId = "RequestBlock";

export type Events = {
  changeState: State;
  updateRules: Rules;
};

export interface Service extends ServiceBase<Events> {
  enable(): Promise<void>;
  disable(): Promise<void>;
  isEnabled(): Promise<boolean>;
  update(): Promise<void>;
}
