import { ChromeStorageApi } from "@/modules/chrome/api";
import { RuleSets } from "@/modules/core/rules";
import { State } from "@/modules/core/state";
import { RESERVED_RULE_ID_MAX } from "@/modules/rules/reserved";
import { StoredRuleSets } from "../rules/stored";
import { ServiceConfigurationStore } from "./ServiceConfigurationStore";

export class ServiceConfigurationStoreImpl
  implements ServiceConfigurationStore
{
  private storage: ChromeStorageApi;

  constructor(storage: ChromeStorageApi) {
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

  async loadRuleSets(): Promise<StoredRuleSets> {
    const ruleSets = await this.storage.get<StoredRuleSets>("ruleSets");
    return ruleSets ?? [];
  }

  async saveLanguage(lang: string | undefined): Promise<void> {
    if (lang) {
      await this.storage.set("language", lang);
    } else {
      await this.storage.remove("language");
    }
  }

  async loadLanguage(): Promise<string | undefined> {
    return await this.storage.get<string | undefined>("language");
  }
}
