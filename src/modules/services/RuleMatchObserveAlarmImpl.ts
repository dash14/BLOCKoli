import { ChromeAlarmsApi, ChromeDeclarativeNetRequestApi } from "../chrome/api";
import {
  RuleMatchObserveAlarmListener,
  RuleMatchObserveAlarm,
} from "./RuleMatchObserveAlarm";

const ALARM_NAME = "RuleMatchObserveAlarm";

export class RuleMatchObserveAlarmImpl implements RuleMatchObserveAlarm {
  private listener: RuleMatchObserveAlarmListener | null = null;
  private alarms: ChromeAlarmsApi;
  private declarativeNetRequest: ChromeDeclarativeNetRequestApi;
  private onAlarmHandler: () => void;
  constructor(
    alarms: ChromeAlarmsApi,
    declarativeNetRequest: ChromeDeclarativeNetRequestApi
  ) {
    this.alarms = alarms;
    this.declarativeNetRequest = declarativeNetRequest;
    this.onAlarmHandler = () => this.onAlarm();
  }

  public async activate(): Promise<void> {
    this.alarms.addOnAlarmListener(this.onAlarmHandler);
    await this.resetAlarm();
  }

  public async deactivate(): Promise<void> {
    this.alarms.removeOnAlarmListener(this.onAlarmHandler);
    this.alarms.clear(ALARM_NAME);
  }

  public setOnAlarmListener(listener: RuleMatchObserveAlarmListener): void {
    this.listener = listener;
  }

  private async resetAlarm(): Promise<void> {
    const alarm = await this.alarms.get(ALARM_NAME);
    if (alarm) {
      this.alarms.clear(ALARM_NAME);
    }
    const net = this.declarativeNetRequest;
    const interval = net.getGetMatchedRulesQuotaInterval();
    const max = net.getMaxGetMatchedRulesCallsPerInterval();
    this.alarms.create(ALARM_NAME, {
      periodInMinutes: Math.max(interval / max, 0.5) * 2, // 1 min.
    });
  }

  private async onAlarm() {
    this.listener?.();
  }
}
