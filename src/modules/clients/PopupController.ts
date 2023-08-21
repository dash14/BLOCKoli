import { MessageProxyFactory } from "@/modules/chrome/message/MessageProxy";
import * as RequestBlock from "@/modules/services/RequestBlockService";
import { MessageProxy } from "@/modules/chrome/message/types";
import { State } from "@/modules/core/state";

export class PopupController {
  private requestBlockService: MessageProxy<RequestBlock.Service>;
  private initialized = false;

  constructor() {
    this.requestBlockService =
      new MessageProxyFactory().create<RequestBlock.Service>(
        RequestBlock.ServiceId
      );
  }

  public async initialize(setState: (state: State) => void) {
    if (this.initialized) return;
    this.initialized = true;
    const isEnabled = await this.requestBlockService.isEnabled();
    this.requestBlockService.addEventListener("changeState", setState);
    setState(isEnabled ? "enable" : "disable");
  }

  public async destroy(): Promise<void> {
    this.requestBlockService.removeAllEventListeners();
  }

  public async toggleEnable() {
    const isEnabled = await this.requestBlockService.isEnabled();
    if (isEnabled) {
      await this.requestBlockService.disable();
    } else {
      await this.requestBlockService.enable();
    }
  }
}
