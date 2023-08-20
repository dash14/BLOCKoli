import { RuleSets } from "@/modules/core/rules";
import { State } from "@/modules/core/state";
import { ServiceConfigurationStore } from "./ServiceConfigurationStore";

export class ServiceConfigurationStoreImpl
  implements ServiceConfigurationStore
{
  async saveState(state: State): Promise<void> {
    await chrome.storage.sync.set({ state });
  }

  async loadState(): Promise<State> {
    const loaded = await chrome.storage.sync.get(["state"]);
    return loaded.state ?? "disable";
  }

  async saveRules(ruleSets: Rules): Promise<void> {
  }

  async loadRules(): Promise<Rules> {
  }
}
