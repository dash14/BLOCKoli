import { describe, expect, it, vi } from "vitest";
import { RuleActionType } from "@/modules/core/rules";
import { toRuleList, walkRules } from "./rulesets";
import { RULE_ID_EDITING, RULE_ID_UNSAVED } from "./stored";
import type { StoredRuleSets, StoredRule } from "./stored";

describe("rulesets", () => {
  describe("toRuleList", () => {
    it("returns empty array for empty ruleSets", () => {
      const ruleSets: StoredRuleSets = [];
      const result = toRuleList(ruleSets);

      expect(result).toEqual([]);
    });

    it("returns empty array for ruleSet with no rules", () => {
      const ruleSets: StoredRuleSets = [{ name: "Empty Set", rules: [] }];
      const result = toRuleList(ruleSets);

      expect(result).toEqual([]);
    });

    it("returns rules from single ruleSet", () => {
      const ruleSets: StoredRuleSets = [
        {
          name: "Set 1",
          rules: [
            { id: 1, action: { type: RuleActionType.BLOCK }, condition: {} },
            { id: 2, action: { type: RuleActionType.ALLOW }, condition: {} },
          ],
        },
      ];

      const result = toRuleList(ruleSets);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it("returns rules from multiple ruleSets", () => {
      const ruleSets: StoredRuleSets = [
        {
          name: "Set 1",
          rules: [
            { id: 1, action: { type: RuleActionType.BLOCK }, condition: {} },
          ],
        },
        {
          name: "Set 2",
          rules: [
            { id: 2, action: { type: RuleActionType.BLOCK }, condition: {} },
            { id: 3, action: { type: RuleActionType.BLOCK }, condition: {} },
          ],
        },
      ];

      const result = toRuleList(ruleSets);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(3);
    });

    it("excludes rules with RULE_ID_UNSAVED", () => {
      const ruleSets: StoredRuleSets = [
        {
          name: "Set 1",
          rules: [
            { id: 1, action: { type: RuleActionType.BLOCK }, condition: {} },
            {
              id: RULE_ID_UNSAVED,
              action: { type: RuleActionType.BLOCK },
              condition: {},
            },
            { id: 2, action: { type: RuleActionType.BLOCK }, condition: {} },
          ],
        },
      ];

      const result = toRuleList(ruleSets);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it("excludes rules with RULE_ID_EDITING", () => {
      const ruleSets: StoredRuleSets = [
        {
          name: "Set 1",
          rules: [
            { id: 1, action: { type: RuleActionType.BLOCK }, condition: {} },
            {
              id: RULE_ID_EDITING,
              action: { type: RuleActionType.BLOCK },
              condition: {},
            },
          ],
        },
      ];

      const result = toRuleList(ruleSets);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });
  });

  describe("walkRules", () => {
    it("does not call walker for empty ruleSets", () => {
      const walker = vi.fn();
      const ruleSets: StoredRuleSets = [];

      walkRules(ruleSets, walker);

      expect(walker).not.toHaveBeenCalled();
    });

    it("calls walker for each valid rule", () => {
      const walker = vi.fn();
      const ruleSets: StoredRuleSets = [
        {
          name: "Set 1",
          rules: [
            { id: 1, action: { type: RuleActionType.BLOCK }, condition: {} },
            { id: 2, action: { type: RuleActionType.BLOCK }, condition: {} },
          ],
        },
      ];

      walkRules(ruleSets, walker);

      expect(walker).toHaveBeenCalledTimes(2);
    });

    it("passes rule, index, and ruleSet to walker", () => {
      const walker = vi.fn();
      const rule: StoredRule = {
        id: 1,
        action: { type: RuleActionType.BLOCK },
        condition: {},
      };
      const ruleSet = { name: "Test Set", rules: [rule] };
      const ruleSets: StoredRuleSets = [ruleSet];

      walkRules(ruleSets, walker);

      expect(walker).toHaveBeenCalledWith(rule, 0, ruleSet);
    });

    it("passes correct index for multiple rules", () => {
      const indices: number[] = [];
      const walker = vi.fn((_rule, index) => {
        indices.push(index);
      });
      const ruleSets: StoredRuleSets = [
        {
          name: "Set 1",
          rules: [
            { id: 1, action: { type: RuleActionType.BLOCK }, condition: {} },
            { id: 2, action: { type: RuleActionType.BLOCK }, condition: {} },
            { id: 3, action: { type: RuleActionType.BLOCK }, condition: {} },
          ],
        },
      ];

      walkRules(ruleSets, walker);

      expect(indices).toEqual([0, 1, 2]);
    });

    it("skips rules with RULE_ID_UNSAVED", () => {
      const walker = vi.fn();
      const ruleSets: StoredRuleSets = [
        {
          name: "Set 1",
          rules: [
            { id: 1, action: { type: RuleActionType.BLOCK }, condition: {} },
            {
              id: RULE_ID_UNSAVED,
              action: { type: RuleActionType.BLOCK },
              condition: {},
            },
            { id: 2, action: { type: RuleActionType.BLOCK }, condition: {} },
          ],
        },
      ];

      walkRules(ruleSets, walker);

      expect(walker).toHaveBeenCalledTimes(2);
      const calledIds = walker.mock.calls.map((call) => call[0].id);
      expect(calledIds).toEqual([1, 2]);
    });

    it("skips rules with RULE_ID_EDITING", () => {
      const walker = vi.fn();
      const ruleSets: StoredRuleSets = [
        {
          name: "Set 1",
          rules: [
            {
              id: RULE_ID_EDITING,
              action: { type: RuleActionType.BLOCK },
              condition: {},
            },
            { id: 1, action: { type: RuleActionType.BLOCK }, condition: {} },
          ],
        },
      ];

      walkRules(ruleSets, walker);

      expect(walker).toHaveBeenCalledTimes(1);
      expect(walker.mock.calls[0][0].id).toBe(1);
    });

    it("walks rules from multiple ruleSets", () => {
      const ruleSetNames: string[] = [];
      const walker = vi.fn((_rule, _index, ruleSet) => {
        ruleSetNames.push(ruleSet.name);
      });
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
            { id: 2, action: { type: RuleActionType.BLOCK }, condition: {} },
          ],
        },
      ];

      walkRules(ruleSets, walker);

      expect(ruleSetNames).toEqual(["Set A", "Set B"]);
    });
  });
});
