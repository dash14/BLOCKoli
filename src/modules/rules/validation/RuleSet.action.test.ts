import { describe, expect, it } from "vitest";
import { Rule, RuleSet } from "@/modules/core/rules";
import { validateRuleSet } from "./RuleSet";

function ruleToRuleSet(rule: unknown): RuleSet {
  return { name: "rule set", rules: [rule as Rule] };
}

describe("validateRuleSet: RuleSet#action", () => {
  const validCondition = {
    requestDomains: ["www.example.com"],
  };
  describe("Rule `action' field", () => {
    it("[invalid] not specified", () => {
      const targetRule = { condition: validCondition };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleSetField: "rules",
            ruleNumber: 0,
            message: "must have required property 'action'",
          },
        ],
      });
    });

    it("[invalid] not object", () => {
      const targetRule = { action: [], condition: validCondition };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleSetField: "rules",
            ruleNumber: 0,
            ruleField: "action",
            message: "must be object",
          },
        ],
      });
    });
  });

  describe("Rule `action.type' field", () => {
    const validActions = ["block", "allow"];
    validActions.forEach((actionType) => {
      it(`[valid] '${actionType}'`, () => {
        const targetRule = {
          action: { type: actionType },
          condition: validCondition,
        };
        const ruleSet = ruleToRuleSet(targetRule);
        const result = validateRuleSet(ruleSet);
        expect(result).toStrictEqual({
          valid: true,
          evaluated: ruleSet,
        });
      });
    });

    const invalidActions = ["", "invalid"];
    invalidActions.forEach((actionType) => {
      it(`[invalid] '${actionType}'`, () => {
        const targetRule = {
          action: { type: actionType },
          condition: validCondition,
        };
        const ruleSet = ruleToRuleSet(targetRule);
        const result = validateRuleSet(ruleSet);
        expect(result).toStrictEqual({
          valid: false,
          errors: [
            {
              ruleSetField: "rules",
              ruleNumber: 0,
              ruleField: "action.type",
              message: "must be either 'block' or 'allow'",
            },
          ],
        });
      });
    });

    it(`[invalid] not specified`, () => {
      const targetRule = {
        action: {},
        condition: validCondition,
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleSetField: "rules",
            ruleNumber: 0,
            ruleField: "action",
            message: "must have required property 'type'",
          },
        ],
      });
    });
  });
});
