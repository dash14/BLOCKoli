import { MessageProxyFactory } from "@/modules/chrome/message/MessageProxy";
import * as RequestBlock from "@/modules/services/RequestBlockService";
import { MessageProxy } from "@/modules/chrome/message/types";
import logging from "@/modules/utils/logging";
import { RuleSets, newRuleTemplate } from "../core/rules";
import cloneDeep from "lodash-es/cloneDeep";
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
    return [
      {
        name: "My RuleSet 1",
        rules: [{ ...cloneDeep(newRuleTemplate), id: 1 }],
      },
    ];
  }
}
