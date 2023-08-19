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

    // Store
    const store = new ServiceConfigurationStoreImpl();

    // Chrome API
    const chrome = new ChromeApiFactory().declarativeNetRequest();

    // Request Block Service
    const requestBlockService = new RequestBlockServiceImpl(
      server,
      store,
      chrome
    );

    // Start
    server.start(requestBlockService);
  }
}
