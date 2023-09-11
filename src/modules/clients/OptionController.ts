import { MessageProxyFactory } from "@/modules/chrome/message/MessageProxy";
import * as RequestBlock from "@/modules/services/RequestBlockService";
import { MessageProxy } from "@/modules/chrome/message/types";
import logging from "@/modules/utils/logging";
import { RuleSets } from "../core/rules";
const log = logging.getLogger("options");

export class OptionController {
  private requestBlockService: MessageProxy<RequestBlock.Service>;

  constructor() {
    log.debug("create");
    this.requestBlockService =
      new MessageProxyFactory().create<RequestBlock.Service>(
        RequestBlock.ServiceId
      );
  }

  async getRuleSets(): Promise<RuleSets> {
    return await this.requestBlockService.getRuleSets();
  }

  async updateRuleSets(ruleSets: RuleSets): Promise<RuleSets> {
    return await this.requestBlockService.updateRuleSets(ruleSets);
  }
}
