import {
  RequestMethod,
  ResourceType,
  RuleActionType,
  Rules,
} from "@/modules/core/rules";
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
    await chrome.storage.sync.set({ ruleSets });
  }

  async loadRules(): Promise<Rules> {
    // const loaded = await chrome.storage.sync.get(["ruleSets"]);
    // return loaded.ruleSets ?? [];
    return [
      {
        id: 1,
        action: {
          type: RuleActionType.BLOCK,
        },
        condition: {
          initiatorDomains: ["www.netflix.com"],
          requestMethods: [RequestMethod.GET],
          resourceTypes: [ResourceType.IMAGE],
        },
      },
    ];
  }
}
