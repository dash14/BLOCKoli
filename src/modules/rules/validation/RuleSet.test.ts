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
});
