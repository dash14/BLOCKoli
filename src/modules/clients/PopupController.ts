import { State } from "@/modules/core/state";
import logging from "@/modules/utils/logging";
import { ChromeApiDeclarativeNetRequest } from "@/modules/chrome/api";
import { ClientController } from "./ClientController";
import { RuleActionType, RuleSets } from "../core/rules";
import { walkRules } from "../rules/rulesets";

const log = logging.getLogger("popup");

interface RulePointer {
  ruleSetName: string;
  number: number;
  isBlocking: boolean;
}
type RulePointers = Map<number, RulePointer>;

export interface MatchedRule {
  ruleId: number;
  rule?: RulePointer;
  timeStamp: Date;
}

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

  public async getMatchedRulesInActiveTab(): Promise<MatchedRule[]> {
    const matchedRules = await this.chrome.getMatchedRulesInActiveTab();
    if (matchedRules.length === 0) {
      return [];
    }
    const ruleSets = await this.requestBlockService.getRuleSets();
    const pointers = this.convertToRulePointers(ruleSets);
    const results: MatchedRule[] = [];
    matchedRules.map((rule) => {
      const ruleId = rule.rule.ruleId;
      results.push({
        ruleId,
        rule: pointers.get(ruleId),
        timeStamp: new Date(rule.timeStamp),
      });
    });
    return results.reverse();
  }

  private convertToRulePointers(ruleSets: RuleSets): RulePointers {
    const pointers = new Map<number, RulePointer>();
    walkRules(ruleSets, (rule, index, ruleSet) => {
      pointers.set(rule.id, {
        ruleSetName: ruleSet.name,
        number: index + 1,
        isBlocking: rule.action.type == RuleActionType.BLOCK,
      });
    });
    return pointers;
  }
}
