import { MessageServer } from "@/modules/chrome/message/MessageServer";
import { RequestBlockServiceEvents } from "../interfaces/RequestBlockService";
import { RequestBlockServiceImpl } from "./RequestBlockServiceImpl";

export class MainController {
  public run() {
    const requestBlockServer = new MessageServer<RequestBlockServiceEvents>(
      "RequestBlock"
    );
    const requestBlockService = new RequestBlockServiceImpl(requestBlockServer);
    requestBlockServer.start(requestBlockService);
  }
}
