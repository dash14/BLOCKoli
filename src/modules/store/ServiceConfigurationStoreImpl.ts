import {
  RequestMethod,
  ResourceType,
  RuleActionType,
  Rules,
} from "@/modules/core/rules";
import { State } from "@/modules/core/state";
import { ServiceConfigurationStore } from "./ServiceConfigurationStore";
import { ChromeApiStorage } from "../chrome/api";

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

  async saveRules(rules: Rules): Promise<void> {
    await this.storage.set("rules", rules);
  }

  async loadRules(): Promise<Rules> {
    // const rules = await this.storage.get("rules");
    // return rules ?? [];
    return [
      {
        id: 1,
        action: {
          type: RuleActionType.BLOCK,
        },
        condition: {
          initiatorDomains: ["www.example.com"],
          requestMethods: [RequestMethod.GET],
          resourceTypes: [ResourceType.IMAGE],
        },
      },
    ];
  }
}
