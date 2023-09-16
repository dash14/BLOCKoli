import { RuleSets } from "@/modules/core/rules";
import { State } from "@/modules/core/state";
import { ServiceConfigurationStore } from "./ServiceConfigurationStore";
import { ChromeApiStorage } from "../chrome/api";
import { RESERVED_RULE_ID_MAX } from "../rules/reserved";

export class ServiceConfigurationStoreImpl
  implements ServiceConfigurationStore
{
  private storage: ChromeApiStorage;

  constructor(storage: ChromeApiStorage) {
    this.storage = storage;
  }
  async saveState(state: State): Promise<void> {
    await this.storage.set("state", state);
  }

  async loadState(): Promise<State> {
    const state = await this.storage.get<State>("state");
    return state ?? "disable";
  }

  async saveNextRuleId(id: number): Promise<void> {
    await this.storage.set("nextRuleId", id);
  }

  async loadNextRuleId(): Promise<number> {
    const nextId = await this.storage.get<number>("nextRuleId");
    return nextId ?? RESERVED_RULE_ID_MAX + 1;
  }

  async saveRuleSets(ruleSets: RuleSets): Promise<void> {
    await this.storage.set("ruleSets", ruleSets);
  }

  async loadRuleSets(): Promise<RuleSets> {
    const ruleSets = await this.storage.get<RuleSets>("ruleSets");
    return ruleSets ?? [];
  }
}
