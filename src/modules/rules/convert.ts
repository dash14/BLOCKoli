import { Rule as ApiRule } from "@/modules/chrome/api";
import { RuleWithId } from "@/modules/core/rules";

export function convertToApiRule(rules: RuleWithId[]): ApiRule[] {
  return rules.map((rule) => {
    return {
      id: rule.id,
      action: rule.action,
      condition: {
        // An empty list is not allowed.
        initiatorDomains: emptyToUndefined(rule.condition.initiatorDomains),
        requestMethods: emptyToUndefined(rule.condition.requestMethods),
        resourceTypes: emptyToUndefined(rule.condition.resourceTypes),

        // Only one of urlFilter or regexFilter can be specified.
        urlFilter: rule.condition.isRegexFilter
          ? undefined
          : rule.condition.urlFilter,
        regexFilter: rule.condition.isRegexFilter
          ? rule.condition.urlFilter
          : undefined,
      },
    } as ApiRule;
  });
}

function emptyToUndefined<T>(list: T[] | undefined): T[] | undefined {
  if (!list || list.length === 0) {
    return undefined;
  } else {
    return list;
  }
}
