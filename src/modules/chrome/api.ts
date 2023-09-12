import {
  RequestMethod,
  ResourceType,
  RuleAction,
  Rules,
} from "@/modules/core/rules";

export interface ChromeApiStorage {
  /** Gets an item from storage. */
  get<T>(key: string): Promise<T | undefined>;

  /** Sets an item. */
  set<T>(key: string, value: T): Promise<void>;

  /** Removes an item from storage. */
  remove(key: string): Promise<void>;
}

export interface RuleCondition {
  /**
   * The rule will only match network requests originating from the list of initiatorDomains.
   */
  initiatorDomains?: string[] | undefined;

  /**
   * The pattern which is matched against the network request url.
   */
  urlFilter?: string | undefined;

  /**
   * Regular expression to match against the network request url.
   */
  regexFilter?: string | undefined;

  /**
   * List of HTTP request methods which the rule can match.
   */
  requestMethods?: RequestMethod[];

  /**
   * List of resource types which the rule can match.
   * An empty list is not allowed.
   */
  resourceTypes?: ResourceType[] | undefined;
}

export interface Rule {
  /** The action to take if this rule is matched. */
  action: RuleAction;

  /** The condition under which this rule is triggered. */
  condition: RuleCondition;

  /** An id which uniquely identifies a rule.
   * Mandatory and should be >= 1.
   */
  id: number;
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

export interface RegexOptions {
  isCaseSensitive?: boolean | undefined;
  regex: string;
}

export enum UnsupportedRegexReason {
  SYNTAX_ERROR = "syntaxError",
  MEMORY_LIMIT_EXCEEDED = "memoryLimitExceeded",
}

export interface IsRegexSupportedResult {
  isSupported: boolean;
  reason?: UnsupportedRegexReason | undefined;
}

export interface ChromeApiDeclarativeNetRequest {
  updateDynamicRules(options: UpdateRuleOptions): Promise<void>;
  getDynamicRules(): Promise<Rules>;
  removeAllDynamicRules(): Promise<void>;
  getMatchedRulesInActiveTab(): Promise<MatchedRuleInfo[]>;
  isRegexSupported(options: RegexOptions): Promise<IsRegexSupportedResult>;
}
