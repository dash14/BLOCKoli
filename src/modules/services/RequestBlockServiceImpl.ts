import isEqual from "lodash-es/isEqual";
import {
  ChromeActionApi,
  ChromeDeclarativeNetRequestApi,
  ChromeI18nApi,
  ChromeRuntimeApi,
} from "@/modules/chrome/api";
import { Rule as ApiRule } from "@/modules/chrome/api";
import {
  MatchedRule,
  RULE_ID_UNSAVED,
  RuleActionType,
  RulePointer,
  RuleSets,
} from "@/modules/core/rules";
import { EventEmitter, ServiceBase } from "@/modules/core/service";
import { convertToApiRule } from "@/modules/rules/convert";
import { toRuleList, walkRules } from "@/modules/rules/rulesets";
import * as RequestBlock from "@/modules/services/RequestBlockService";
import { ServiceConfigurationStore } from "@/modules/store/ServiceConfigurationStore";
import logging from "@/modules/utils/logging";

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
  private runtime: ChromeRuntimeApi;
  private declarativeNetRequest: ChromeDeclarativeNetRequestApi;
  private action: ChromeActionApi;
  private i18n: ChromeI18nApi;

  constructor(
    emitter: EventEmitter<RequestBlock.Events>,
    store: ServiceConfigurationStore,
    runtime: ChromeRuntimeApi,
    declarativeNetRequest: ChromeDeclarativeNetRequestApi,
    action: ChromeActionApi,
    i18n: ChromeI18nApi
  ) {
    super(emitter);
    this.store = store;
    this.runtime = runtime;
    this.declarativeNetRequest = declarativeNetRequest;
    this.action = action;
    this.i18n = i18n;
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
    // Load from store
    const ruleSets = await this.store.loadRuleSets();
    log.debug("loadRuleSets from store", ruleSets);
    return ruleSets;
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
      const matchedRule = pointers.get(ruleId);
      if (matchedRule) {
        results.push({
          ruleId,
          rule: matchedRule,
          timeStamp: rule.timeStamp,
        });
      }
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

  public async getLanguage(): Promise<string> {
    const defaultLang = this.i18n.getUILanguage();
    const lang = (await this.store.loadLanguage()) ?? defaultLang;
    return lang;
  }

  public async setLanguage(lang: string): Promise<void> {
    const defaultLang = this.i18n.getUILanguage();
    // If the language is the same as the default language,
    // specify undefined, which means to adapt to the environment.
    const value = defaultLang === lang ? undefined : lang;
    await this.store.saveLanguage(value);
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
    isEqual(rule1.condition.requestDomains, rule2.condition.requestDomains) &&
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
