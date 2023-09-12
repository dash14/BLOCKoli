import logging from "@/modules/utils/logging";
import { RuleSets } from "../core/rules";
import { ClientController } from "./ClientController";
const log = logging.getLogger("options");

export class OptionController extends ClientController {
  constructor() {
    super();
  }

  async getRuleSets(): Promise<RuleSets> {
    return await this.requestBlockService.getRuleSets();
  }

  async updateRuleSets(ruleSets: RuleSets): Promise<RuleSets> {
    return await this.requestBlockService.updateRuleSets(ruleSets);
  }
}
