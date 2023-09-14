import { State } from "@/modules/core/state";
import logging from "@/modules/utils/logging";
import {
  ChromeApiDeclarativeNetRequest,
  MatchedRuleInfo,
} from "@/modules/chrome/api";
import { ClientController } from "./ClientController";

const log = logging.getLogger("popup");

export class PopupController extends ClientController {
  private chrome: ChromeApiDeclarativeNetRequest;

  constructor(chrome: ChromeApiDeclarativeNetRequest) {
    log.debug("create");
    super();
    this.chrome = chrome;
  }

  public async initialize(setState: (state: State) => void) {
    if (this.initialized) return;

    log.debug("initialize");

    this.initialized = true;
    const isEnabled = await this.requestBlockService.isEnabled();
    this.requestBlockService.addEventListener("changeState", setState);
    setState(isEnabled ? "enable" : "disable");
  }

  public async getMatchedRulesInActiveTab(): Promise<MatchedRuleInfo[]> {
    return await this.chrome.getMatchedRulesInActiveTab();
  }
}
