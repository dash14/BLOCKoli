import * as RequestBlock from "@/modules/services/RequestBlockService";
import { EventEmitter, ServiceBase } from "@/modules/core/service";
import { ServiceConfigurationStore } from "@/modules/store/ServiceConfigurationStore";
import {
  ChromeApiAction,
  ChromeApiDeclarativeNetRequest,
  ChromeApiRuntime,
} from "@/modules/chrome/api";
import logging from "@/modules/utils/logging";
import {
  MatchedRule,
  RULE_ID_UNSAVED,
  RuleActionType,
  RulePointer,
  RuleSets,
} from "@/modules/core/rules";
import isEqual from "lodash-es/isEqual";
import { toRuleList, walkRules } from "@/modules/rules/rulesets";
import { Rule as ApiRule } from "@/modules/chrome/api";

import { convertToApiRule } from "@/modules/rules/convert";
import { getReservedRules } from "../rules/reserved";

const log = logging.getLogger("RequestBlock");

const ENABLED_ICON = "./images/icon16.png";
const DISABLED_ICON = "./images/icon16-gray.png";

type RulePointers = Map<number, RulePointer>;

export class RequestBlockServiceImpl
  extends ServiceBase<RequestBlock.Events>
  implements RequestBlock.Service
{
  private store: ServiceConfigurationStore;
  private runtime: ChromeApiRuntime;
  private declarativeNetRequest: ChromeApiDeclarativeNetRequest;
  private action: ChromeApiAction;

  constructor(
    emitter: EventEmitter<RequestBlock.Events>,
    store: ServiceConfigurationStore,
    runtime: ChromeApiRuntime,
    declarativeNetRequest: ChromeApiDeclarativeNetRequest,
    action: ChromeApiAction
  ) {
    super(emitter);
    this.store = store;
    this.runtime = runtime;
    this.declarativeNetRequest = declarativeNetRequest;
    this.action = action;
  }

  public async start(): Promise<void> {
    if (await this.isEnabled()) {
      await this.activate();
    } else {
      await this.deactivate();
    }
  }

  public async enable(): Promise<void> {
    const state = await this.store.loadState();
    if (state === "enable") return;

    log.debug("enable");

    await this.activate();

    await this.store.saveState("enable");
    this.emitter.emit("changeState", "enable");
  }

  public async disable(): Promise<void> {
    const state = await this.store.loadState();
    if (state === "disable") return;

    log.debug("disable");

    await this.deactivate();

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

    const prevRuleSets = await this.getRuleSets();
    if (isEqual(ruleSets, prevRuleSets)) {
      log.debug("No updated");
      return ruleSets;
    }

    // Assign ID to new rules
    await this.assignRuleId(ruleSets);

    // Update to chrome
    if (await this.isEnabled()) {
      await this.applyRuleSets(ruleSets);
    }

    // Save to store
    await this.store.saveRuleSets(ruleSets);

    return ruleSets;
  }

  private async applyRuleSets(ruleSets: RuleSets): Promise<void> {
    const rules: ApiRule[] = [
      ...getReservedRules(this.runtime.getId()),
      ...convertToApiRule(toRuleList(ruleSets)),
    ];

    const prevRules = await this.declarativeNetRequest.getDynamicRules();

    const { removeRuleIds, addRules } = diffRules(rules, prevRules);
    const dynamicRules = { removeRuleIds, addRules };

    await this.declarativeNetRequest.updateDynamicRules(dynamicRules);
  }

  public async getMatchedRules(): Promise<MatchedRule[]> {
    let matchedRules =
      await this.declarativeNetRequest.getMatchedRulesInActiveTab();
    if (matchedRules.length === 0) {
      return [];
    }

    // remove reserved rule
    const reservedRules = getReservedRules(this.runtime.getId());
    const reservedIds = new Set(reservedRules.map((rule) => rule.id));
    matchedRules = matchedRules.filter(
      (rule) => !reservedIds.has(rule.rule.ruleId)
    );

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

  private async activate(): Promise<void> {
    log.info("Activate");
    // Apply rules
    const ruleSets = await this.store.loadRuleSets();
    await this.applyRuleSets(ruleSets);

    // Update icon
    this.action.setIcon({ path: ENABLED_ICON });
  }

  private async deactivate(): Promise<void> {
    log.info("Deactivate");

    // clear rules
    await this.declarativeNetRequest.removeAllDynamicRules();

    // Update icon
    this.action.setIcon({ path: DISABLED_ICON });
  }

  private async assignRuleId(ruleSets: RuleSets): Promise<void> {
    let nextId = await this.store.loadNextRuleId();
    ruleSets.forEach((ruleSet) => {
      ruleSet.rules.forEach((rule) => {
        if (rule.id === RULE_ID_UNSAVED) {
          rule.id = nextId++;
        }
      });
    });
    await this.store.saveNextRuleId(nextId);
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

function diffRules(rules: ApiRule[], prevRules: ApiRule[]) {
  const removeRuleIds: number[] = [];
  const addRules: ApiRule[] = [];

  const prevRuleMap = new Map<number, ApiRule>(
    prevRules.map((rule) => [rule.id, rule])
  );

  rules.forEach((rule) => {
    const prevRule = prevRuleMap.get(rule.id);
    if (!prevRule) {
      // add
      addRules.push(rule);
      return;
    }

    if (!isEqualRule(rule, prevRule)) {
      // replace
      removeRuleIds.push(rule.id);
      addRules.push(rule);
    }
  });

  const currentRuleIdSet = new Set<number>(rules.map((rule) => rule.id));

  for (const id of prevRuleMap.keys()) {
    if (!currentRuleIdSet.has(id)) {
      // remove
      removeRuleIds.push(id);
    }
  }

  return { removeRuleIds, addRules };
}

function isEqualRule(rule1: ApiRule, rule2: ApiRule) {
  return (
    // id
    rule1.id === rule2.id &&
    // action
    isEqual(rule1.action, rule2.action) &&
    // condition
    isEqual(
      rule1.condition.initiatorDomains,
      rule2.condition.initiatorDomains
    ) &&
    rule1.condition.urlFilter === rule2.condition.urlFilter &&
    rule1.condition.regexFilter === rule2.condition.regexFilter &&
    isEqual(rule1.condition.requestMethods, rule2.condition.requestMethods) &&
    isEqual(rule1.condition.resourceTypes, rule2.condition.resourceTypes) &&
    // priority
    rule1.priority === rule2.priority
  );
}
