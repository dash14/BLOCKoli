import { ChromeActionApiImpl } from "./action";
import { ChromeAlarmsApiImpl } from "./alarms";
import {
  ChromeActionApi,
  ChromeAlarmsApi,
  ChromeDeclarativeNetRequestApi,
  ChromeI18nApi,
  ChromeRuntimeApi,
  ChromeStorageApi,
  ChromeTabsApi,
} from "./api";
import { ChromeDeclarativeNetRequestApiImpl } from "./declarativeNetRequest";
import { ChromeI18nApiImpl } from "./i18n";
import { ChromeRuntimeApiImpl } from "./runtime";
import { ChromeStorageApiImpl } from "./storage";
import { ChromeTabsApiImpl } from "./tabs";

export class ChromeApiFactory {
  public isExtension(): boolean {
    return !!chrome.declarativeNetRequest;
  }

  public storage(): ChromeStorageApi {
    return new ChromeStorageApiImpl(chrome.storage.local);
  }

  public session(): ChromeStorageApi {
    return new ChromeStorageApiImpl(chrome.storage.session);
  }

  public declarativeNetRequest(): ChromeDeclarativeNetRequestApi {
    return new ChromeDeclarativeNetRequestApiImpl();
  }

  public action(): ChromeActionApi {
    return new ChromeActionApiImpl();
  }

  public runtime(): ChromeRuntimeApi {
    return new ChromeRuntimeApiImpl();
  }

  public i18n(): ChromeI18nApi {
    return new ChromeI18nApiImpl();
  }

  public tabs(): ChromeTabsApi {
    return new ChromeTabsApiImpl();
  }

  public alarms(): ChromeAlarmsApi {
    return new ChromeAlarmsApiImpl();
  }
}
