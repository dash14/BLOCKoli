import { RuleSets } from "@/modules/core/rules";
import { State } from "@/modules/core/state";

export interface ServiceConfigurationStore {
  saveState(state: State): Promise<void>;
  loadState(): Promise<State>;
  saveRules(ruleSets: RuleSets): Promise<void>;
  loadRules(): Promise<RuleSets>;
}
