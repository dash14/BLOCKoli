import { RuleSets } from "@/modules/core/rules";
import { State } from "@/modules/core/state";

export interface ServiceConfigurationStore {
  saveState(state: State): Promise<void>;
  loadState(): Promise<State>;
  saveNextRuleId(id: number): Promise<void>;
  loadNextRuleId(): Promise<number>;
  saveRuleSets(ruleSets: RuleSets): Promise<void>;
  loadRuleSets(): Promise<RuleSets>;
  saveLanguage(lang: string | undefined): Promise<void>;
  loadLanguage(): Promise<string | undefined>;
}
