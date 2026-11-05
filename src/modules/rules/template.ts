import { Rule, RuleActionType } from "@/modules/core/rules";

export const newRuleTemplate: Rule = {
  action: {
    type: RuleActionType.BLOCK,
  },
  condition: {},
};

// New rule sets get this name and the next free number
export const newRuleSetName = "My Rule Set";
