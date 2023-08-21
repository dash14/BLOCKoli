import { MessageProxyFactory } from "@/modules/chrome/message/MessageProxy";
import * as RequestBlock from "@/modules/services/RequestBlockService";
import { MessageProxy } from "@/modules/chrome/message/types";
import { State } from "@/modules/core/state";
import logging from "@/modules/utils/logging";

const log = logging.getLogger("popup");

export class PopupController {
  private requestBlockService: MessageProxy<RequestBlock.Service>;
  private initialized = false;

  constructor() {
    log.debug("create");
    this.requestBlockService =
      new MessageProxyFactory().create<RequestBlock.Service>(
        RequestBlock.ServiceId
      );
  }

  public async initialize(setState: (state: State) => void) {
    if (this.initialized) return;

    log.debug("initialize");

    this.initialized = true;
    const isEnabled = await this.requestBlockService.isEnabled();
    this.requestBlockService.addEventListener("changeState", setState);
    setState(isEnabled ? "enable" : "disable");
  }

  public async destroy(): Promise<void> {
    if (!this.initialized) return;

    log.debug("destroy");

    this.initialized = false;
    this.requestBlockService.removeAllEventListeners();
  }

  public async toggleEnable() {
    const isEnabled = await this.requestBlockService.isEnabled();
    if (isEnabled) {
      log.debug("request to disable");
      await this.requestBlockService.disable();
    } else {
      log.debug("request to enable");
      await this.requestBlockService.enable();
    }
  }
}
