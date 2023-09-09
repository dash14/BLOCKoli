import { ChromeApiDeclarativeNetRequest, ChromeApiStorage } from "./api";
import { ChromeApiDeclarativeNetRequestImpl } from "./declarativeNetRequest";
import { ChromeApiStorageImpl } from "./storage";

export class ChromeApiFactory {
  public isExtension(): boolean {
    return !!chrome.declarativeNetRequest;
  }

  public storage(): ChromeApiStorage {
    return new ChromeApiStorageImpl(chrome.storage.sync);
  }

  public declarativeNetRequest(): ChromeApiDeclarativeNetRequest {
    return new ChromeApiDeclarativeNetRequestImpl();
  }
}
