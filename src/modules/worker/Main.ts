import { ChromeApiFactory } from "@/modules/chrome/factory";
import { MessageServer } from "@/modules/chrome/message/MessageServer";
import * as RequestBlock from "@/modules/services/RequestBlockService";
import { RequestBlockServiceImpl } from "@/modules/services/RequestBlockServiceImpl";
import { ServiceConfigurationStoreImpl } from "@/modules/store/ServiceConfigurationStoreImpl";

export class Main {
  private runState: boolean = false;

  public run() {
    if (this.runState) return;
    this.runState = true;

    // Message Server
    const server = new MessageServer<RequestBlockServiceImpl>(
      RequestBlock.ServiceId
    );

    // Chrome API
    const chrome = new ChromeApiFactory();

    // Store
    const store = new ServiceConfigurationStoreImpl(chrome.storage());

    // Request Block Service
    const requestBlockService = new RequestBlockServiceImpl(
      server,
      store,
      chrome.runtime(),
      chrome.declarativeNetRequest(),
      chrome.action(),
      chrome.i18n()
    );

    // Start
    server.start(requestBlockService);
  }
}
