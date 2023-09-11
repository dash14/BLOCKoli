import * as RequestBlock from "@/modules/services/RequestBlockService";
import { EventEmitter, ServiceBase } from "@/modules/core/service";
import { ServiceConfigurationStore } from "@/modules/store/ServiceConfigurationStore";
import { ChromeApiDeclarativeNetRequest } from "@/modules/chrome/api";
import logging from "@/modules/utils/logging";
import { RULE_ID_UNSAVED, RuleSets } from "../core/rules";

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

    // Save to store
    await this.store.saveRuleSets(ruleSets);

    // TODO: Update to chrome
    return ruleSets;
  }

  private async run(): Promise<void> {
    // clear rules
    await this.chrome.removeAllDynamicRules();

    const ruleSets = await this.store.loadRuleSets();
    if (ruleSets.length === 0) return;

    // this.chrome.updateDynamicRules({ addRules: rules });
  }
}
