import { describe, expect, it } from "vitest";
import { Rule, RuleActionType, RuleSets } from "@/modules/core/rules";
import { validateRuleSets } from "./RuleSets";

describe("validateRuleSets: RuleSets", () => {
  const validCondition = {
    requestDomains: ["www.example.com"],
  };
  const validRule: Rule = {
    action: {
      type: RuleActionType.BLOCK,
    },
    condition: validCondition,
  };

  describe("RuleSets array", () => {
    it("[valid] empty", () => {
      const ruleSets: RuleSets = []; // empty
      const result = validateRuleSets(ruleSets);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: [],
      });
    });

    it("[valid] present", () => {
      const ruleSets: RuleSets = [{ name: "rule set", rules: [validRule] }];
      const result = validateRuleSets(ruleSets);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: [{ name: "rule set", rules: [validRule] }],
      });
    });

    it("[invalid] not array", () => {
      const ruleSets = {};
      const result = validateRuleSets(ruleSets);
      expect(result).toStrictEqual({
        valid: false,
        errors: [{ message: "must be array" }],
      });
    });

    it("[invalid] A ruleSetNumber is specified in the RuleSet error", () => {
      const ruleSets = [
        {
          name: "rule set 1",
          rules: [
            {
              action: { type: "block" },
              condition: { requestMethods: ["invalid"] },
            },
          ],
        },
        {
          name: "rule set 2",
          rules: [
            {
              action: { type: "allow" },
              condition: { resourceTypes: ["invalid"] },
            },
          ],
        },
      ];
      const result = validateRuleSets(ruleSets);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleSetNumber: 0,
            ruleSetField: "rules",
            ruleNumber: 0,
            ruleField: "condition.requestMethods",
            message: "must be equal to one of the allowed values",
          },
          {
            ruleSetNumber: 1,
            ruleSetField: "rules",
            ruleNumber: 0,
            ruleField: "condition.resourceTypes",
            message: "must be equal to one of the allowed values",
          },
        ],
      });
    });
  });
});
