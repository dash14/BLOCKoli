import { MessageProxyFactory } from "@/modules/chrome/message/MessageProxy";
import {
  RequestBlockService,
  RequestBlockServiceEvents,
} from "../interfaces/RequestBlockService";
import { MessageProxy } from "@/modules/chrome/message/types";

export class PopupController {
  private requestBlockService: MessageProxy<
    RequestBlockService,
    RequestBlockServiceEvents
  >;

  constructor() {
    this.requestBlockService = new MessageProxyFactory().create<
      RequestBlockService,
      RequestBlockServiceEvents
    >("RequestBlock");

    this.requestBlockService.addEventListener("changeState", (state) => {
      console.log("Receive broadcast!", state);
    });
  }

  public async onClick() {
    console.log("onClick -> call enable");
    await this.requestBlockService.enable();
    console.log("onClick -> called enable");
    const isEnabled = await this.requestBlockService.isEnabled();
    console.log("isEnabled:", isEnabled);
  }
}
