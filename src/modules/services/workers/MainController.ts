import { MessageServer } from "@/modules/chrome/message/MessageServer";
import * as RequestBlock from "../interfaces/RequestBlockService";
import { RequestBlockServiceImpl } from "./RequestBlockServiceImpl";

export class MainController {
  public run() {
    const requestBlockServer = new MessageServer<RequestBlock.Events>(
      RequestBlock.ServiceId
    );
    const requestBlockService = new RequestBlockServiceImpl(requestBlockServer);
    requestBlockServer.start(requestBlockService);
  }
}
