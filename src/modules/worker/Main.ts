import { MessageServer } from "@/modules/chrome/message/MessageServer";
import * as RequestBlock from "@/modules/services/RequestBlockService";
import { RequestBlockServiceImpl } from "@/modules/services/RequestBlockServiceImpl";
import { ServiceConfigurationStoreImpl } from "@/modules/store/ServiceConfigurationStoreImpl";
import { ChromeApiFactory } from "@/modules/chrome/factory";

export class Main {
  public run() {
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
      chrome.declarativeNetRequest(),
      chrome.action()
    );

    // Start
    server.start(requestBlockService);
  }
}
