import {
  ChromeApiAction,
  ChromeApiDeclarativeNetRequest,
  ChromeApiStorage,
} from "./api";
import { ChromeApiActionImpl } from "./action";
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

  public action(): ChromeApiAction {
    return new ChromeApiActionImpl();
  }
}
