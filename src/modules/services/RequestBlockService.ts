import { ServiceBase } from "@/modules/core/service";

export const ServiceId = "RequestBlock";

export interface RuleSet {
  id: string;
}

export interface RequestBlockServiceConfiguration {
  ruleSet: RuleSet[];
}

export type Events = {
  changeState: "enable" | "disable";
  updateConfig: RequestBlockServiceConfiguration;
};

export interface Service extends ServiceBase {
  enable(): Promise<void>;
  disable(): Promise<void>;
  isEnabled(): Promise<boolean>;
  update(): Promise<void>;
}
