import { MessageServer } from "@/modules/chrome/message/MessageServer";
import * as RequestBlock from "@/modules/services/RequestBlockService";
import { RequestBlockServiceImpl } from "@/modules/services/RequestBlockServiceImpl";

export class Main {
  public run() {
    const server = new MessageServer<RequestBlockServiceImpl>(
      RequestBlock.ServiceId
    );
    const requestBlockService = new RequestBlockServiceImpl(server);
    server.start(requestBlockService);
  }
}
