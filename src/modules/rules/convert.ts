import { Rule as ApiRule } from "@/modules/chrome/api";
import { RESOURCE_TYPES } from "@/modules/core/rules";
import { StoredRule } from "./stored";

export function convertToApiRule(rules: StoredRule[]): ApiRule[] {
  return rules.map((rule) => {
    const apiRule = {
      id: rule.id,
      action: rule.action,
      condition: {},
    } as ApiRule;

    // An empty list is not allowed.
    const requestDomains = emptyToUndefined(rule.condition.requestDomains);
    if (requestDomains) {
      apiRule.condition.requestDomains = requestDomains;
    }
    const initiatorDomains = emptyToUndefined(rule.condition.initiatorDomains);
    if (initiatorDomains) {
      apiRule.condition.initiatorDomains = initiatorDomains;
    }
    const requestMethods = emptyToUndefined(rule.condition.requestMethods);
    if (requestMethods) {
      apiRule.condition.requestMethods = requestMethods;
    }
    const resourceTypes = emptyToUndefined(rule.condition.resourceTypes);
    if (resourceTypes) {
      apiRule.condition.resourceTypes = resourceTypes;
    } else {
      // convert to specify all types
      // (If empty, all frames except main_frame are targeted.)
      apiRule.condition.resourceTypes = RESOURCE_TYPES;
    }

    // Only one of urlFilter or regexFilter can be specified.
    if (rule.condition.urlFilter) {
      if (rule.condition.isRegexFilter) {
        apiRule.condition.regexFilter = rule.condition.urlFilter;
      } else {
        apiRule.condition.urlFilter = rule.condition.urlFilter;
      }
    }
    return apiRule;
  });
}

function emptyToUndefined<T>(list: T[] | undefined): T[] | undefined {
  if (!list || list.length === 0) {
    return undefined;
  } else {
    return list;
  }
}
