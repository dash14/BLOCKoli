import * as RequestBlock from "@/modules/services/RequestBlockService";
import { EventEmitter, ServiceBase } from "@/modules/core/service";
import { ServiceConfigurationStore } from "@/modules/store/ServiceConfigurationStore";
import {
  ChromeApiAction,
  ChromeApiDeclarativeNetRequest,
} from "@/modules/chrome/api";
import logging from "@/modules/utils/logging";
import {
  MatchedRule,
  RULE_ID_UNSAVED,
  RuleActionType,
  RulePointer,
  RuleSets,
  RuleWithId,
} from "@/modules/core/rules";
import isEqual from "lodash-es/isEqual";
import {
  toRuleIdSet,
  toRuleList,
  toRuleMap,
  walkRules,
} from "@/modules/rules/rulesets";
import { convertToApiRule } from "@/modules/rules/convert";

const log = logging.getLogger("RequestBlock");

const ENABLED_ICON = "./images/icon16.png";
const DISABLED_ICON = "./images/icon16-gray.png";

type RulePointers = Map<number, RulePointer>;

export class RequestBlockServiceImpl
  extends ServiceBase<RequestBlock.Events>
  implements RequestBlock.Service
{
  private store: ServiceConfigurationStore;
  private chrome: ChromeApiDeclarativeNetRequest;
  private action: ChromeApiAction;

  constructor(
    emitter: EventEmitter<RequestBlock.Events>,
    store: ServiceConfigurationStore,
    chrome: ChromeApiDeclarativeNetRequest,
    action: ChromeApiAction
  ) {
    super(emitter);
    this.store = store;
    this.chrome = chrome;
    this.action = action;
  }

  public async start(): Promise<void> {
    const state = await this.store.loadState();
    if (state === "enable") {
      log.debug("start");
      await this.run();
    }
  }

  public async enable(): Promise<void> {
    const state = await this.store.loadState();
    if (state === "enable") return;

    log.debug("enable");

    this.run();

    await this.store.saveState("enable");
    this.emitter.emit("changeState", "enable");

    // update icon
    this.action.setIcon({ path: ENABLED_ICON });
  }

  public async disable(): Promise<void> {
    const state = await this.store.loadState();
    if (state === "disable") return;

    log.debug("disable");

    // clear rules
    await this.chrome.removeAllDynamicRules();

    await this.store.saveState("disable");
    this.emitter.emit("changeState", "disable");

    // update icon
    this.action.setIcon({ path: DISABLED_ICON });
  }

  public async isEnabled(): Promise<boolean> {
    return (await this.store.loadState()) === "enable";
  }

  public async getRuleSets(): Promise<RuleSets> {
    log.debug("getRuleSets");

    // Load from store
    return await this.store.loadRuleSets();
  }

  public async updateRuleSets(ruleSets: RuleSets): Promise<RuleSets> {
    log.debug("updateRuleSets");

    // Assign ID to new rules
    let nextId = await this.store.loadNextRuleId();
    ruleSets.forEach((ruleSet) => {
      ruleSet.rules.forEach((rule) => {
        if (rule.id === RULE_ID_UNSAVED) {
          rule.id = nextId++;
        }
      });
    });
    await this.store.saveNextRuleId(nextId);

    // Update to chrome
    if (await this.isEnabled()) {
      const prevRuleSets = await this.store.loadRuleSets();
      const { removeIdList, addRuleList } = diffRules(ruleSets, prevRuleSets);
      const addRules = convertToApiRule(addRuleList);
      const dynamicRules = {
        removeRuleIds: removeIdList,
        addRules,
      };
      log.info("Update dynamic rule:", dynamicRules);
      await this.chrome.updateDynamicRules(dynamicRules);
    }

    // Save to store
    await this.store.saveRuleSets(ruleSets);

    return ruleSets;
  }

  public async getMatchedRules(): Promise<MatchedRule[]> {
    const matchedRules = await this.chrome.getMatchedRulesInActiveTab();
    if (matchedRules.length === 0) {
      return [];
    }

    const ruleSets = await this.getRuleSets();
    const pointers = this.convertToRulePointers(ruleSets);

    const results: MatchedRule[] = [];
    matchedRules.map((rule) => {
      const ruleId = rule.rule.ruleId;
      results.push({
        ruleId,
        rule: pointers.get(ruleId),
        timeStamp: rule.timeStamp,
      });
    });
    log.debug("Matched rule:", results);
    return results;
  }

  private async run(): Promise<void> {
    log.info("Start service");
    // clear rules
    await this.chrome.removeAllDynamicRules();

    if (await this.isEnabled()) {
      const ruleSets = await this.store.loadRuleSets();
      const rules = toRuleList(ruleSets);
      const addRules = convertToApiRule(rules);
      if (addRules.length > 0) {
        log.info("Update dynamic rule:", { addRules });
        await this.chrome.updateDynamicRules({ addRules });
      } else {
        log.info("Rule is empty");
      }
    } else {
      // do nothing
    }
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

function diffRules(ruleSets: RuleSets, prevRuleSets: RuleSets) {
  const prevRules = toRuleMap(prevRuleSets);

  const removeIdList: number[] = [];
  const addRuleList: RuleWithId[] = [];

  walkRules(ruleSets, (rule) => {
    if (!prevRules.has(rule.id)) {
      // add
      addRuleList.push(rule);
      return;
    }

    const prevRule = prevRules.get(rule.id);
    if (!isEqual(rule, prevRule)) {
      // replace
      removeIdList.push(rule.id);
      addRuleList.push(rule);
    }
  });

  const currentRuleIdSet = toRuleIdSet(ruleSets);
  for (const id of prevRules.keys()) {
    if (!currentRuleIdSet.has(id)) {
      // remove
      removeIdList.push(id);
    }
  }

  return { removeIdList, addRuleList };
}
