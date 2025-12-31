import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { RuleActionType } from "@/modules/core/rules";
import {
  RULE_ID_EDITING,
  RULE_ID_UNSAVED,
  StoredRule,
  StoredRuleSets,
} from "@/modules/rules/stored";
import { useRuleSetsEdit } from "./useRuleSetsEdit";

// Test data: valid saved rule
const savedRule: StoredRule = {
  id: 1,
  action: { type: RuleActionType.BLOCK },
  condition: { requestDomains: ["example.com"] },
};

// Test data: rule being edited
const editingRule: StoredRule = {
  id: RULE_ID_EDITING,
  action: { type: RuleActionType.BLOCK },
  condition: {},
};

// Test data: sample rule sets
const sampleRuleSets: StoredRuleSets = [
  {
    name: "Block Ads",
    rules: [savedRule],
  },
  {
    name: "Allow Trusted",
    rules: [{ ...savedRule, id: 2 }],
  },
];

describe("useRuleSetsEdit", () => {
  describe("initial state", () => {
    test("returns originalRuleSets", () => {
      const onChange = vi.fn();
      const onRemoveRuleSetAt = vi.fn();
      const { result } = renderHook(() =>
        useRuleSetsEdit(sampleRuleSets, onChange, onRemoveRuleSetAt)
      );

      expect(result.current.ruleSets).toEqual(sampleRuleSets);
    });

    test("returns empty array when originalRuleSets is empty", () => {
      const onChange = vi.fn();
      const onRemoveRuleSetAt = vi.fn();
      const { result } = renderHook(() =>
        useRuleSetsEdit([], onChange, onRemoveRuleSetAt)
      );

      expect(result.current.ruleSets).toEqual([]);
    });
  });

  describe("addRuleSet", () => {
    test("adds new rule set with sequential name", () => {
      const onChange = vi.fn();
      const onRemoveRuleSetAt = vi.fn();
      const { result } = renderHook(() =>
        useRuleSetsEdit([], onChange, onRemoveRuleSetAt)
      );

      act(() => {
        result.current.addRuleSet();
      });

      expect(result.current.ruleSets).toHaveLength(1);
      expect(result.current.ruleSets[0].name).toBe("My Rule Set 1");
      expect(result.current.ruleSets[0].rules).toHaveLength(1);
      expect(result.current.ruleSets[0].rules[0].id).toBe(RULE_ID_EDITING);
    });

    test("respects existing 'My Rule Set N' naming", () => {
      const onChange = vi.fn();
      const onRemoveRuleSetAt = vi.fn();
      const existingRuleSets: StoredRuleSets = [
        { name: "My Rule Set 1", rules: [savedRule] },
        { name: "My Rule Set 3", rules: [savedRule] },
      ];
      const { result } = renderHook(() =>
        useRuleSetsEdit(existingRuleSets, onChange, onRemoveRuleSetAt)
      );

      act(() => {
        result.current.addRuleSet();
      });

      // Should use 4 since 3 is the max existing number
      expect(result.current.ruleSets).toHaveLength(3);
      expect(result.current.ruleSets[2].name).toBe("My Rule Set 4");
    });

    test("adds rule set with RULE_ID_EDITING rule", () => {
      const onChange = vi.fn();
      const onRemoveRuleSetAt = vi.fn();
      const { result } = renderHook(() =>
        useRuleSetsEdit(sampleRuleSets, onChange, onRemoveRuleSetAt)
      );

      act(() => {
        result.current.addRuleSet();
      });

      const newRuleSet = result.current.ruleSets[2];
      expect(newRuleSet.rules[0].id).toBe(RULE_ID_EDITING);
    });
  });

  describe("updateRules", () => {
    test("updates rules in rule set", () => {
      const onChange = vi.fn();
      const onRemoveRuleSetAt = vi.fn();
      const { result } = renderHook(() =>
        useRuleSetsEdit(sampleRuleSets, onChange, onRemoveRuleSetAt)
      );

      const updatedRules: StoredRule[] = [
        {
          id: RULE_ID_UNSAVED,
          action: { type: RuleActionType.ALLOW },
          condition: { requestDomains: ["updated.com"] },
        },
      ];

      act(() => {
        result.current.updateRules(updatedRules, 0);
      });

      expect(result.current.ruleSets[0].rules).toEqual(updatedRules);
      expect(onChange).toHaveBeenCalled();
    });

    test("removes rule set when rules are empty", () => {
      const onChange = vi.fn();
      const onRemoveRuleSetAt = vi.fn();
      const { result } = renderHook(() =>
        useRuleSetsEdit(sampleRuleSets, onChange, onRemoveRuleSetAt)
      );

      act(() => {
        result.current.updateRules([], 0);
      });

      expect(result.current.ruleSets).toHaveLength(1);
      expect(result.current.ruleSets[0].name).toBe("Allow Trusted");
      expect(onRemoveRuleSetAt).toHaveBeenCalledWith(0);
    });

    test("filters out RULE_ID_EDITING rules when calling onChange", () => {
      const onChange = vi.fn();
      const onRemoveRuleSetAt = vi.fn();
      const { result } = renderHook(() =>
        useRuleSetsEdit(sampleRuleSets, onChange, onRemoveRuleSetAt)
      );

      const rulesWithEditing: StoredRule[] = [savedRule, editingRule];

      act(() => {
        result.current.updateRules(rulesWithEditing, 0);
      });

      // onChange should receive filtered rules (without RULE_ID_EDITING)
      const onChangeArg = onChange.mock.calls[0][0] as StoredRuleSets;
      expect(onChangeArg[0].rules).toHaveLength(1);
      expect(onChangeArg[0].rules[0].id).toBe(savedRule.id);
    });
  });

  describe("removeRuleSet", () => {
    test("removes rule set at specified index", () => {
      const onChange = vi.fn();
      const onRemoveRuleSetAt = vi.fn();
      const { result } = renderHook(() =>
        useRuleSetsEdit(sampleRuleSets, onChange, onRemoveRuleSetAt)
      );

      act(() => {
        result.current.removeRuleSet(0);
      });

      expect(result.current.ruleSets).toHaveLength(1);
      expect(result.current.ruleSets[0].name).toBe("Allow Trusted");
      expect(onRemoveRuleSetAt).toHaveBeenCalledWith(0);
      expect(onChange).toHaveBeenCalled();
    });

    test("removes rule set with only RULE_ID_EDITING rules without calling onChange", () => {
      const onChange = vi.fn();
      const onRemoveRuleSetAt = vi.fn();
      const ruleSetsWithEditing: StoredRuleSets = [
        { name: "New Rule Set", rules: [editingRule] },
        sampleRuleSets[0],
      ];
      const { result } = renderHook(() =>
        useRuleSetsEdit(ruleSetsWithEditing, onChange, onRemoveRuleSetAt)
      );

      act(() => {
        result.current.removeRuleSet(0);
      });

      expect(result.current.ruleSets).toHaveLength(1);
      expect(onRemoveRuleSetAt).toHaveBeenCalledWith(0);
    });
  });

  describe("updateRuleSetTitle", () => {
    test("updates rule set name", () => {
      const onChange = vi.fn();
      const onRemoveRuleSetAt = vi.fn();
      const { result } = renderHook(() =>
        useRuleSetsEdit(sampleRuleSets, onChange, onRemoveRuleSetAt)
      );

      act(() => {
        result.current.updateRuleSetTitle("New Title", 0);
      });

      expect(result.current.ruleSets[0].name).toBe("New Title");
      expect(onChange).toHaveBeenCalled();
    });

    test("preserves rules when updating title", () => {
      const onChange = vi.fn();
      const onRemoveRuleSetAt = vi.fn();
      const { result } = renderHook(() =>
        useRuleSetsEdit(sampleRuleSets, onChange, onRemoveRuleSetAt)
      );

      act(() => {
        result.current.updateRuleSetTitle("Updated Name", 0);
      });

      expect(result.current.ruleSets[0].rules).toEqual(sampleRuleSets[0].rules);
    });
  });

  describe("merge editing state", () => {
    test("merges editing rules when originalRuleSets changes", () => {
      const onChange = vi.fn();
      const onRemoveRuleSetAt = vi.fn();
      const { result, rerender } = renderHook(
        ({ ruleSets }) =>
          useRuleSetsEdit(ruleSets, onChange, onRemoveRuleSetAt),
        { initialProps: { ruleSets: sampleRuleSets } }
      );

      // Add editing rule to first rule set
      const rulesWithEditing: StoredRule[] = [savedRule, editingRule];
      act(() => {
        result.current.updateRules(rulesWithEditing, 0);
      });

      // Internal state now has editing rule
      expect(result.current.ruleSets[0].rules).toHaveLength(2);

      // Simulate external update (e.g., from storage)
      const updatedRuleSets: StoredRuleSets = [
        { name: "Block Ads", rules: [savedRule] },
        { name: "Allow Trusted", rules: [{ ...savedRule, id: 2 }] },
      ];

      rerender({ ruleSets: updatedRuleSets });

      // Editing rule should be preserved
      expect(result.current.ruleSets[0].rules).toHaveLength(2);
      expect(result.current.ruleSets[0].rules[1].id).toBe(RULE_ID_EDITING);
    });

    test("does not merge when ruleSets is empty (initial load)", () => {
      const onChange = vi.fn();
      const onRemoveRuleSetAt = vi.fn();
      const { result, rerender } = renderHook(
        ({ ruleSets }) =>
          useRuleSetsEdit(ruleSets, onChange, onRemoveRuleSetAt),
        { initialProps: { ruleSets: [] as StoredRuleSets } }
      );

      expect(result.current.ruleSets).toHaveLength(0);

      // Provide initial data
      rerender({ ruleSets: sampleRuleSets });

      expect(result.current.ruleSets).toEqual(sampleRuleSets);
    });
  })

  describe("onChange filtering", () => {
    test("filters out rule sets with only RULE_ID_EDITING rules", () => {
      const onChange = vi.fn();
      const onRemoveRuleSetAt = vi.fn();
      const { result } = renderHook(() =>
        useRuleSetsEdit(sampleRuleSets, onChange, onRemoveRuleSetAt)
      );

      // Add new rule set (contains only editing rule)
      act(() => {
        result.current.addRuleSet();
      });

      // Update existing rule set to trigger onChange
      act(() => {
        result.current.updateRuleSetTitle("Updated", 0);
      });

      // onChange should not include the new rule set (only editing rule)
      const onChangeArg = onChange.mock.calls[0][0] as StoredRuleSets;
      expect(onChangeArg).toHaveLength(2); // Only original rule sets
    });
  });
});
