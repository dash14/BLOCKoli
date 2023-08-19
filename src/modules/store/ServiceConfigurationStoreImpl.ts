import { RuleSets } from "@/modules/core/rules";
import { State } from "@/modules/core/state";
import { ServiceConfigurationStore } from "./ServiceConfigurationStore";

export class ServiceConfigurationStoreImpl
  implements ServiceConfigurationStore
{
  async saveState(state: State): Promise<void> {
    console.log("ServiceConfigurationStoreImpl#saveState");
  }

  async loadState(): Promise<State> {
  }

  async saveRules(ruleSets: Rules): Promise<void> {
  }

  async loadRules(): Promise<Rules> {
  }
}
