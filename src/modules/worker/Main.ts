import { MessageServer } from "@/modules/chrome/message/MessageServer";
import * as RequestBlock from "@/modules/services/RequestBlockService";
import { RequestBlockServiceImpl } from "@/modules/services/RequestBlockServiceImpl";

export class Main {
  public run() {
    const requestBlockServer = new MessageServer<RequestBlock.Events>(
      RequestBlock.ServiceId
    );
    const requestBlockService = new RequestBlockServiceImpl(requestBlockServer);
    requestBlockServer.start(requestBlockService);
  }
}
