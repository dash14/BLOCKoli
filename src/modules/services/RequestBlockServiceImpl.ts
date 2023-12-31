import isEqual from "lodash-es/isEqual";
import {
  ChromeActionApi,
  ChromeDeclarativeNetRequestApi,
  ChromeI18nApi,
  ChromeRuntimeApi,
} from "@/modules/chrome/api";
import { Rule as ApiRule } from "@/modules/chrome/api";
import { RuleActionType } from "@/modules/core/rules";
import { EventEmitter, ServiceBase } from "@/modules/core/service";
import { convertToApiRule } from "@/modules/rules/convert";
import { ExportedRuleSets } from "@/modules/rules/export";
import { MatchedRule, RulePointer } from "@/modules/rules/matched";
import { getReservedRules } from "@/modules/rules/reserved";
import { toRuleList, walkRules } from "@/modules/rules/rulesets";
import { RULE_ID_UNSAVED, StoredRuleSets } from "@/modules/rules/stored";
import { RuleSetsValidationError } from "@/modules/rules/validation/RuleSets";
import * as RequestBlock from "@/modules/services/RequestBlockService";
import { ServiceConfigurationStore } from "@/modules/store/ServiceConfigurationStore";
import logging from "@/modules/utils/logging";
import { performExportCommand } from "./commands/export";
import { performImportCommand } from "./commands/import";

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

  public async getRuleSets(): Promise<StoredRuleSets> {
    // Load from store
    const ruleSets = await this.store.loadRuleSets();
    log.debug("loadRuleSets from store", ruleSets);
    return ruleSets;
  }

  public async updateRuleSets(
    ruleSets: StoredRuleSets
  ): Promise<StoredRuleSets> {
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

    // Emit a event
    this.emitter.emit("updateRuleSets", ruleSets);

    return ruleSets;
  }

  private async applyRuleSets(ruleSets: StoredRuleSets): Promise<void> {
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

  private async assignRuleId(ruleSets: StoredRuleSets): Promise<void> {
    let nextId = await this.store.loadNextRuleId();
    ruleSets.forEach((ruleSet) => {
      ruleSet.rules.forEach((rule) => {
        if (!rule.id || rule.id === RULE_ID_UNSAVED) {
          rule.id = nextId++;
        }
      });
    });
    await this.store.saveNextRuleId(nextId);
  }

  private convertToRulePointers(ruleSets: StoredRuleSets): RulePointers {
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

  public async export(): Promise<ExportedRuleSets> {
    const stored = await this.getRuleSets();
    return performExportCommand(stored);
  }

  public async import(
    object: object
  ): Promise<[boolean, RuleSetsValidationError[]]> {
    const storedRuleSets = await this.store.loadRuleSets();

    const [valid, errors, ruleSets] = performImportCommand(
      object,
      storedRuleSets
    );

    if (valid) {
      await this.updateRuleSets(ruleSets);
    }

    return [valid, errors];
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
