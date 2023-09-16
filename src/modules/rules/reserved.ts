import { RuleActionType } from "../core/rules";
import { Rule } from "@/modules/chrome/api";

export const RESERVED_RULE_ID_MAX = 10; // 1-10 is reserved

export function getReservedRules(extensionId: string) {
  const RESERVED_RULES: Rule[] = [
    {
      id: 1,
      action: {
        type: RuleActionType.ALLOW,
      },
      condition: {
        initiatorDomains: [extensionId],
      },
      priority: 100,
    },
  ];
  return RESERVED_RULES;
}
