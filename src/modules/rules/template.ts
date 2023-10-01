import {
  RULE_ID_EDITING,
  RuleActionType,
  RuleSet,
  RuleWithId,
} from "@/modules/core/rules";

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
