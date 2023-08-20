import { Rules } from "@/modules/core/rules";
import { State } from "@/modules/core/state";

export interface ServiceConfigurationStore {
  saveState(state: State): Promise<void>;
  loadState(): Promise<State>;
  saveRules(ruleSets: Rules): Promise<void>;
  loadRules(): Promise<Rules>;
}
