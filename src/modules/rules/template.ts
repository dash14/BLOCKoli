import { RuleActionType } from "@/modules/core/rules";
import { RULE_ID_EDITING, StoredRule, StoredRuleSet } from "./stored";

export const newRuleTemplate: StoredRule = {
  id: RULE_ID_EDITING,
  action: {
    type: RuleActionType.BLOCK,
  },
  condition: {},
};

// Each new rule set gets its own ID when it is created
export const newRuleSetTemplate: Omit<StoredRuleSet, "id"> = {
  name: "My Rule Set",
  rules: [newRuleTemplate],
};
