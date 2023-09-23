/** Describes the kind of action to take if a given RuleCondition matches. */
export enum RuleActionType {
  BLOCK = "block",
  ALLOW = "allow",
}

export interface RuleAction {
  /** The type of action to perform. */
  type: RuleActionType;
}

/** This describes the HTTP request method of a network request.  */
export enum RequestMethod {
  CONNECT = "connect",
  DELETE = "delete",
  GET = "get",
  HEAD = "head",
  OPTIONS = "options",
  PATCH = "patch",
  POST = "post",
  PUT = "put",
}

export const REQUEST_METHODS = [
  RequestMethod.GET,
  RequestMethod.POST,
  RequestMethod.PATCH,
  RequestMethod.PUT,
  RequestMethod.DELETE,
  RequestMethod.CONNECT,
  RequestMethod.HEAD,
  RequestMethod.OPTIONS,
];

/** This describes the resource type of the network request. */
export enum ResourceType {
  MAIN_FRAME = "main_frame",
  SUB_FRAME = "sub_frame",
  STYLESHEET = "stylesheet",
  SCRIPT = "script",
  IMAGE = "image",
  FONT = "font",
  OBJECT = "object",
  XMLHTTPREQUEST = "xmlhttprequest",
  PING = "ping",
  CSP_REPORT = "csp_report",
  MEDIA = "media",
  WEBSOCKET = "websocket",
  OTHER = "other",
}

export const RESOURCE_TYPES = [
  ResourceType.MAIN_FRAME,
  ResourceType.SUB_FRAME,
  ResourceType.STYLESHEET,
  ResourceType.SCRIPT,
  ResourceType.IMAGE,
  ResourceType.FONT,
  ResourceType.OBJECT,
  ResourceType.XMLHTTPREQUEST,
  ResourceType.PING,
  ResourceType.CSP_REPORT,
  ResourceType.MEDIA,
  ResourceType.WEBSOCKET,
  ResourceType.OTHER,
];

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
   * Whether to use regular expressions in the urlFilter.
   */
  isRegexFilter?: boolean | undefined;

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
  action: RuleAction;
  condition: RuleCondition;
}

export interface RuleWithId extends Rule {
  id: number;
}

export type Rules = RuleWithId[];

export interface RuleSet {
  name: string;
  rules: Rules;
}

export type RuleSets = RuleSet[];

export const RULE_ID_EDITING = -1;
export const RULE_ID_UNSAVED = 0;

export const newRuleTemplate: RuleWithId = {
  id: RULE_ID_EDITING,
  action: {
    type: RuleActionType.BLOCK,
  },
  condition: {},
};

export const newRuleSetTemplate: RuleSet = {
  name: "My Rule Set",
  rules: [newRuleTemplate],
};

// matched rules info

export interface RulePointer {
  ruleSetName: string;
  number: number;
  isBlocking: boolean;
}

export interface MatchedRule {
  ruleId: number;
  rule: RulePointer;
  timeStamp: number;
}
