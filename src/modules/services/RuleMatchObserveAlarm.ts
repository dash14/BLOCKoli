export type RuleMatchObserveAlarmListener = () => void;

export interface RuleMatchObserveAlarm {
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  setOnAlarmListener(listener: RuleMatchObserveAlarmListener): void;
}
