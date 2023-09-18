import { Rule as ApiRule } from "@/modules/chrome/api";
import { RuleWithId } from "@/modules/core/rules";

export function convertToApiRule(rules: RuleWithId[]): ApiRule[] {
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
