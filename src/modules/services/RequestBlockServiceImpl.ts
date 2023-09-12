import * as RequestBlock from "@/modules/services/RequestBlockService";
import { EventEmitter, ServiceBase } from "@/modules/core/service";
import { ServiceConfigurationStore } from "@/modules/store/ServiceConfigurationStore";
import { ChromeApiDeclarativeNetRequest } from "@/modules/chrome/api";
import logging from "@/modules/utils/logging";
import { RULE_ID_UNSAVED, RuleSets, RuleWithId } from "@/modules/core/rules";
import isEqual from "lodash-es/isEqual";
import {
  toRuleIdSet,
  toRuleList,
  toRuleMap,
  walkRules,
} from "@/modules/rules/rulesets";
import { convertToApiRule } from "@/modules/rules/convert";

const log = logging.getLogger("RequestBlock");

export class RequestBlockServiceImpl
  extends ServiceBase<RequestBlock.Events>
  implements RequestBlock.Service
{
  private store: ServiceConfigurationStore;
  private chrome: ChromeApiDeclarativeNetRequest;

  constructor(
    emitter: EventEmitter<RequestBlock.Events>,
    store: ServiceConfigurationStore,
    chrome: ChromeApiDeclarativeNetRequest
  ) {
    super(emitter);
    this.store = store;
    this.chrome = chrome;
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
  }

  public async disable(): Promise<void> {
    const state = await this.store.loadState();
    if (state === "disable") return;

    log.debug("disable");

    // clear rules
    await this.chrome.removeAllDynamicRules();

    await this.store.saveState("disable");
    this.emitter.emit("changeState", "disable");
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
