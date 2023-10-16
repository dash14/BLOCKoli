import { State } from "@/modules/core/state";
import { StoredRuleSets } from "../rules/stored";

export interface ServiceConfigurationStore {
  saveState(state: State): Promise<void>;
  loadState(): Promise<State>;
  saveNextRuleId(id: number): Promise<void>;
  loadNextRuleId(): Promise<number>;
  saveRuleSets(ruleSets: StoredRuleSets): Promise<void>;
  loadRuleSets(): Promise<StoredRuleSets>;
  saveLanguage(lang: string | undefined): Promise<void>;
  loadLanguage(): Promise<string | undefined>;
}
