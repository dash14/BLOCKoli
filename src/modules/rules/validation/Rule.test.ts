import { describe, expect, it } from "vitest";
import { RuleActionType } from "@/modules/core/rules";
import { validateRule } from "./Rule";

describe("validateRuleSet: RuleSet", () => {
  describe("Rule object", () => {
    it("[valid]", () => {
      const rule = {
        action: { type: RuleActionType.BLOCK },
        condition: { requestDomains: ["www.example.com"] },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: rule,
      });
    });

    it("[valid] id fields are present", () => {
      const rule = {
        id: 10,
        action: { type: RuleActionType.BLOCK },
        condition: { requestDomains: ["www.example.com"] },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: rule,
      });
    });

    it("[invalid] not object", () => {
      const rule: unknown[] = [];
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: false,
        errors: [{ message: "must be object" }],
      });
    });

    it("[invalid] additional fields are present", () => {
      const rule = {
        action: { type: RuleActionType.BLOCK },
        condition: { requestDomains: ["www.example.com"] },
        additional: true,
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: false,
        errors: [{ message: "must NOT have additional properties" }],
      });
    });

    it("[invalid] multiple error", () => {
      const rule = {
        action: { type: RuleActionType.BLOCK },
        condition: {
          requestDomains: ["www. .com"], // with schema
          urlFilter: "test[", // without schema
          isRegexFilter: true,
        },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleField: "condition.requestDomains",
            message: "must not contain non-ascii code and space",
          },
          {
            ruleField: "condition.urlFilter",
            message: "must not be an invalid regular expression",
          },
        ],
      });
    });
  });
});
