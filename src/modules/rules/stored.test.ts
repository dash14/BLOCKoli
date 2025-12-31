import { describe, expect, it } from "vitest";
import { RULE_ID_EDITING, RULE_ID_UNSAVED } from "./stored";
import type { StoredRule, StoredRules, StoredRuleSet, StoredRuleSets } from "./stored";
import { RuleActionType } from "@/modules/core/rules";

describe("stored", () => {
  describe("RULE_ID_EDITING", () => {
    it("equals -1", () => {
      expect(RULE_ID_EDITING).toBe(-1);
    });

    it("is a number", () => {
      expect(typeof RULE_ID_EDITING).toBe("number");
    });
  });

  describe("RULE_ID_UNSAVED", () => {
    it("equals 0", () => {
      expect(RULE_ID_UNSAVED).toBe(0);
    });

    it("is a number", () => {
      expect(typeof RULE_ID_UNSAVED).toBe("number");
    });
  });

  describe("StoredRule", () => {
    it("extends Rule with required id", () => {
      const rule: StoredRule = {
        id: 1,
        action: { type: RuleActionType.BLOCK },
        condition: {},
      };

      expect(rule.id).toBe(1);
      expect(rule.action.type).toBe("block");
    });

    it("can have editing id", () => {
      const rule: StoredRule = {
        id: RULE_ID_EDITING,
        action: { type: RuleActionType.BLOCK },
        condition: {},
      };

      expect(rule.id).toBe(-1);
    });

    it("can have unsaved id", () => {
      const rule: StoredRule = {
        id: RULE_ID_UNSAVED,
        action: { type: RuleActionType.ALLOW },
        condition: {},
      };

      expect(rule.id).toBe(0);
    });

    it("can have full condition", () => {
      const rule: StoredRule = {
        id: 42,
        action: { type: RuleActionType.BLOCK },
        condition: {
          requestDomains: ["example.com"],
          urlFilter: "test",
          isRegexFilter: false,
        },
      };

      expect(rule.condition.requestDomains).toEqual(["example.com"]);
      expect(rule.condition.urlFilter).toBe("test");
    });
  });

  describe("StoredRules", () => {
    it("is array of StoredRule", () => {
      const rules: StoredRules = [
        { id: 1, action: { type: RuleActionType.BLOCK }, condition: {} },
        { id: 2, action: { type: RuleActionType.ALLOW }, condition: {} },
      ];

      expect(rules).toHaveLength(2);
      expect(rules[0].id).toBe(1);
      expect(rules[1].id).toBe(2);
    });

    it("can be empty array", () => {
      const rules: StoredRules = [];

      expect(rules).toHaveLength(0);
    });
  });

  describe("StoredRuleSet", () => {
    it("has name and rules", () => {
      const ruleSet: StoredRuleSet = {
        name: "My Rules",
        rules: [],
      };

      expect(ruleSet.name).toBe("My Rules");
      expect(ruleSet.rules).toEqual([]);
    });

    it("rules are StoredRules with required id", () => {
      const ruleSet: StoredRuleSet = {
        name: "Test",
        rules: [
          { id: 1, action: { type: RuleActionType.BLOCK }, condition: {} },
        ],
      };

      expect(ruleSet.rules[0].id).toBe(1);
    });

    it("can have multiple rules", () => {
      const ruleSet: StoredRuleSet = {
        name: "Multiple",
        rules: [
          { id: 1, action: { type: RuleActionType.BLOCK }, condition: {} },
          { id: 2, action: { type: RuleActionType.BLOCK }, condition: {} },
          { id: 3, action: { type: RuleActionType.ALLOW }, condition: {} },
        ],
      };

      expect(ruleSet.rules).toHaveLength(3);
    });
  });

  describe("StoredRuleSets", () => {
    it("is array of StoredRuleSet", () => {
      const ruleSets: StoredRuleSets = [
        { name: "Set 1", rules: [] },
        { name: "Set 2", rules: [] },
      ];

      expect(ruleSets).toHaveLength(2);
      expect(ruleSets[0].name).toBe("Set 1");
      expect(ruleSets[1].name).toBe("Set 2");
    });

    it("can be empty array", () => {
      const ruleSets: StoredRuleSets = [];

      expect(ruleSets).toHaveLength(0);
    });

    it("can have nested rules", () => {
      const ruleSets: StoredRuleSets = [
        {
          name: "Set A",
          rules: [
            { id: 1, action: { type: RuleActionType.BLOCK }, condition: {} },
          ],
        },
        {
          name: "Set B",
          rules: [
            { id: 2, action: { type: RuleActionType.ALLOW }, condition: {} },
            { id: 3, action: { type: RuleActionType.BLOCK }, condition: {} },
          ],
        },
      ];

      expect(ruleSets[0].rules).toHaveLength(1);
      expect(ruleSets[1].rules).toHaveLength(2);
    });
  });
});
