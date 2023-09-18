import { ChromeActionApiImpl } from "./action";
import {
  ChromeActionApi,
  ChromeDeclarativeNetRequestApi,
  ChromeRuntimeApi,
  ChromeStorageApi,
} from "./api";
import { ChromeDeclarativeNetRequestApiImpl } from "./declarativeNetRequest";
import { ChromeRuntimeApiImpl } from "./runtime";
import { ChromeStorageApiImpl } from "./storage";

export class ChromeApiFactory {
  public isExtension(): boolean {
    return !!chrome.declarativeNetRequest;
  }

  public storage(): ChromeStorageApi {
    return new ChromeStorageApiImpl(chrome.storage.local);
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
}
