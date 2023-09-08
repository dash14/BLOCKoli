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

export interface RuleCondition {
  /**
   * The rule will only match network requests originating from the list of initiatorDomains.
   */
  initiatorDomains?: string[] | undefined;

  /** Regular expression to match against the network request url. */
  regexFilter?: string | undefined;

  /**
   * List of HTTP request methods which the rule can match. */
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
