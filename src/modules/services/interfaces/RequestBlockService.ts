export interface RuleSet {
  id: string;
}

export interface RequestBlockServiceConfiguration {
  ruleSet: RuleSet[];
}

export type RequestBlockServiceEvents = {
  changeState: "enable" | "disable";
  updateConfig: RequestBlockServiceConfiguration;
};

export interface RequestBlockService {
  enable(): Promise<void>;
  disable(): Promise<void>;
  isEnabled(): Promise<boolean>;
  update(): Promise<void>;
}
