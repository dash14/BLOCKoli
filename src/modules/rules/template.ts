import { RuleActionType } from "@/modules/core/rules";
import { RULE_ID_EDITING, StoredRule, StoredRuleSet } from "./stored";

export const newRuleTemplate: StoredRule = {
  id: RULE_ID_EDITING,
  action: {
    type: RuleActionType.BLOCK,
  },
  condition: {},
};

export const newRuleSetTemplate: StoredRuleSet = {
  name: "My Rule Set",
  rules: [newRuleTemplate],
};
