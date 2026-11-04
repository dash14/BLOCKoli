import { Rule, RuleActionType } from "@/modules/core/rules";

export const newRuleTemplate: Rule = {
  action: {
    type: RuleActionType.BLOCK,
  },
  condition: {},
};

// Numbered from 1 for each rule set added
export const newRuleSetName = "My Rule Set";
