import { Alarm, AlarmCreateInfo, ChromeAlarmsApi } from "./api";

export class ChromeAlarmsApiImpl implements ChromeAlarmsApi {
  create(name: string, alarmInfo: AlarmCreateInfo): Promise<void> {
    return chrome.alarms.create(name, alarmInfo);
  }

  get(name: string): Promise<Alarm> {
    return chrome.alarms.get(name);
  }

  clear(name: string): Promise<boolean> {
    return chrome.alarms.clear(name);
  }

  addOnAlarmListener(listener: (alarm: Alarm) => void): void {
    chrome.alarms.onAlarm.addListener(listener);
  }

  removeOnAlarmListener(listener: (alarm: Alarm) => void): void {
    chrome.alarms.onAlarm.removeListener(listener);
  }
}
