import { Rule, Rules } from "@/modules/core/rules";

export interface ChromeApiStorage {
  /** Gets an item from storage. */
  get<T>(key: string): Promise<T | undefined>;

  /** Sets an item. */
  set<T>(key: string, value: T): Promise<void>;

  /** Removes an item from storage. */
  remove(key: string): Promise<void>;
}

export interface UpdateRuleOptions {
  /** Rules to add. */
  addRules?: Rule[] | undefined;

  /**
   * IDs of the rules to remove.
   * Any invalid IDs will be ignored.
   */
  removeRuleIds?: number[] | undefined;
}

export interface MatchedRule {
  ruleId: number;
}

export interface MatchedRuleInfo {
  rule: MatchedRule;
  tabId: number;
  timeStamp: number;
}

export interface ChromeApiDeclarativeNetRequest {
  updateDynamicRules(options: UpdateRuleOptions): Promise<void>;
  getDynamicRules(): Promise<Rules>;
  removeAllDynamicRules(): Promise<void>;
  getMatchedRulesInActiveTab(): Promise<MatchedRuleInfo[]>;
}
