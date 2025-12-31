import { describe, expect, it } from "vitest";
import { Rule, RuleActionType } from "@/modules/core/rules";
import { validateRuleSet } from "./RuleSet";

describe("validateRuleSet: RuleSet", () => {
  const validCondition = {
    requestDomains: ["www.example.com"],
  };
  const validRule: Rule = {
    action: {
      type: RuleActionType.BLOCK,
    },
    condition: validCondition,
  };

  describe("RuleSet object", () => {
    it("[valid]", () => {
      const ruleSet = { name: "rule set", rules: [validRule] };
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: ruleSet,
      });
    });

    it("[invalid] not object", () => {
      const ruleSet: unknown[] = [];
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [{ message: "must be object" }],
      });
    });

    it("[invalid] additional fields are present", () => {
      const ruleSet = {
        name: "rule set",
        rules: [validRule],
        additional: "test",
      };
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [{ message: "must NOT have additional properties" }],
      });
    });
  });

  describe("RuleSet `name' field", () => {
    it("[invalid] not specified", () => {
      const ruleSet = { rules: [validRule] };
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [{ message: "must have required property 'name'" }],
      });
    });

    it("[invalid] empty", () => {
      const ruleSet = { name: "", rules: [validRule] };
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleSetField: "name",
            message: "must NOT have fewer than 1 characters",
          },
        ],
      });
    });
  });

  describe("RuleSet `rules' field", () => {
    it("[invalid] not specified", () => {
      const ruleSet = { name: "rule set" };
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [{ message: "must have required property 'rules'" }],
      });
    });

    it("[invalid] empty", () => {
      const ruleSet = { name: "rule set", rules: [] };
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleSetField: "rules",
            message: "must NOT have fewer than 1 items",
          },
        ],
      });
    });

    it("[invalid] not array", () => {
      const ruleSet = { name: "rule set", rules: { invalid: true } };
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [{ ruleSetField: "rules", message: "must be array" }],
      });
    });
  });

  describe("validateAdditional errors", () => {
    it("[invalid] rule with empty condition triggers validateAdditional", () => {
      const ruleSet = {
        name: "rule set",
        rules: [
          {
            action: { type: "block" },
            condition: {},
          },
        ],
      };
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleSetField: "rules",
            ruleNumber: 0,
            ruleField: "condition",
            message: "must contain at least one rule",
          },
        ],
      });
    });
  });

  describe("Error sorting", () => {
    it("sorts errors by ruleNumber, keeping same ruleNumber errors together", () => {
      const ruleSet = {
        name: "rule set",
        rules: [
          // Rule 0: multiple errors (same ruleNumber)
          {
            action: { type: "block" },
            condition: {
              resourceTypes: "invalid", // schema error
              urlFilter: "test[", // regex error
              isRegexFilter: true,
            },
          },
        ],
      };
      const result = validateRuleSet(ruleSet);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        // All errors should have ruleNumber 0
        expect(result.errors.every((e) => e.ruleNumber === 0)).toBe(true);
        expect(result.errors.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe("A ruleNumber is specified in the Rule error", () => {
    it("[invalid] not array", () => {
      const ruleSet = {
        name: "rule set",
        rules: [
          // valid
          {
            action: { type: "block" },
            condition: { requestMethods: ["post"] },
          },
          // invalid
          {
            action: { type: "block" },
            condition: { resourceTypes: "invalid" },
          },
          // invalid
          {
            action: { type: "allow" },
            condition: { urlFilter: "test[", isRegexFilter: true },
          },
          // invalid
          {
            action: { type: "invalid" },
            condition: { requestMethods: ["post"] },
          },
        ],
      };
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleSetField: "rules",
            ruleNumber: 1,
            ruleField: "condition.resourceTypes",
            message: "must be array",
          },
          {
            ruleSetField: "rules",
            ruleNumber: 2,
            ruleField: "condition.urlFilter",
            message: "must not be an invalid regular expression",
          },
          {
            ruleSetField: "rules",
            ruleNumber: 3,
            ruleField: "action.type",
            message: "must be either 'block' or 'allow'",
          },
        ],
      });
    });
  });
});
