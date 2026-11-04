import { describe, expect, it } from "vitest";
import { RuleActionType } from "@/modules/core/rules";
import { RULE_ID_UNSAVED, assignRuleSetIds } from "./stored";
import type { StoredRule, StoredRules, StoredRuleSet, StoredRuleSets } from "./stored";

describe("stored", () => {
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
        id: "rs-1",
        name: "My Rules",
        rules: [],
      };

      expect(ruleSet.name).toBe("My Rules");
      expect(ruleSet.rules).toEqual([]);
    });

    it("rules are StoredRules with required id", () => {
      const ruleSet: StoredRuleSet = {
        id: "rs-1",
        name: "Test",
        rules: [
          { id: 1, action: { type: RuleActionType.BLOCK }, condition: {} },
        ],
      };

      expect(ruleSet.rules[0].id).toBe(1);
    });

    it("can have multiple rules", () => {
      const ruleSet: StoredRuleSet = {
        id: "rs-1",
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
        { id: "rs-2", name: "Set 1", rules: [] },
        { id: "rs-3", name: "Set 2", rules: [] },
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
          id: "rs-4",
          name: "Set A",
          rules: [
            { id: 1, action: { type: RuleActionType.BLOCK }, condition: {} },
          ],
        },
        {
          id: "rs-1",
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

  describe("assignRuleSetIds", () => {
    const ruleSet = (id?: unknown) => ({ id, name: "a", rules: [] });

    it("keeps the IDs rule sets already have", () => {
      expect(assignRuleSetIds([ruleSet("x"), ruleSet("y")])).toEqual([
        ruleSet("x"),
        ruleSet("y"),
      ]);
    });

    it("gives a new ID to a rule set without a usable one", () => {
      const assigned = assignRuleSetIds([
        { name: "a", rules: [] },
        ruleSet(""),
        ruleSet(1),
      ]);

      const ids = assigned.map((r) => r.id);
      ids.forEach((id) => expect(id).toMatch(/^[0-9a-f-]{36}$/));
      expect(new Set(ids).size).toBe(3);
    });

    it("gives a new ID to a rule set whose ID an earlier one has", () => {
      const [first, second] = assignRuleSetIds([ruleSet("x"), ruleSet("x")]);

      expect(first.id).toBe("x");
      expect(second.id).not.toBe("x");
    });
  });
});
