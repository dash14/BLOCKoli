import { RequestMethod, ResourceType, RuleAction } from "@/modules/core/rules";

export interface ChromeRuntimeApi {
  getId(): string;
  getURL(path: string): string;
}

export interface TabIconDetails {
  /** Optional. Either a relative image path or a dictionary {size -> relative image path} pointing to icon to be set. If the icon is specified as a dictionary, the actual image to be used is chosen depending on screen's pixel density. If the number of image pixels that fit into one screen space unit equals scale, then image with size scale * 19 will be selected. Initially only scales 1 and 2 will be supported. At least one image must be specified. Note that 'details.path = foo' is equivalent to 'details.imageData = {'19': foo}'  */
  path?: string | { [index: string]: string } | undefined;
}

export interface ChromeActionApi {
  setIcon(details: TabIconDetails): void;
}

export interface ChromeStorageApi {
  /** Gets an item from storage. */
  get<T>(key: string): Promise<T | undefined>;

  /** Sets an item. */
  set<T>(key: string, value: T): Promise<void>;

  /** Removes an item from storage. */
  remove(key: string): Promise<void>;
}

export interface ChromeI18nApi {
  /**
   * Gets the browser UI language of the browser. This is different from i18n.getAcceptLanguages which returns the preferred user languages.
   * @since Chrome 35.
   */
  getUILanguage(): string;

  /**
   * Gets the localized string for the specified message. If the message is missing, this method returns an empty string (''). If the format of the getMessage() call is wrong — for example, messageName is not a string or the substitutions array has more than 9 elements — this method returns undefined.
   * @param messageName The name of the message, as specified in the messages.json file.
   * @param substitutions Optional. Up to 9 substitution strings, if the message requires any.
   */
  getMessage(messageName: string, substitutions?: string | string[]): string;
}

export interface RuleCondition {
  /**
   * The rule will only match network requests when the domain matches one from the list of requestDomains.
   * If the list is omitted, the rule is applied to requests from all domains.
   */
  requestDomains?: string[] | undefined;

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

  /** Rule priority.
   * Defaults to 1.
   * When specified, should be >= 1.
   */
  priority?: number | undefined;
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

export interface ChromeDeclarativeNetRequestApi {
  updateDynamicRules(options: UpdateRuleOptions): Promise<void>;
  getDynamicRules(): Promise<Rule[]>;
  removeAllDynamicRules(): Promise<void>;
  getMatchedRulesInActiveTab(): Promise<MatchedRuleInfo[]>;
  isRegexSupported(options: RegexOptions): Promise<IsRegexSupportedResult>;
}
