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
    id: "rs-1",
    name: "Block Ads",
    rules: [savedRule],
  },
  {
    id: "rs-2",
    name: "Allow Trusted",
    rules: [{ ...savedRule, id: 2 }],
  },
];

describe("useRuleSetsEdit", () => {
  describe("initial state", () => {
    test("returns originalRuleSets", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useRuleSetsEdit(sampleRuleSets, onChange)
      );

      expect(result.current.ruleSets).toEqual(sampleRuleSets);
    });

    test("returns empty array when originalRuleSets is empty", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useRuleSetsEdit([], onChange)
      );

      expect(result.current.ruleSets).toEqual([]);
    });
  });

  describe("addRuleSet", () => {
    test("adds new rule set with sequential name", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useRuleSetsEdit([], onChange)
      );

      act(() => {
        result.current.addRuleSet();
      });

      expect(result.current.ruleSets).toHaveLength(1);
      expect(result.current.ruleSets[0].name).toBe("My Rule Set 1");
      expect(result.current.ruleSets[0].rules).toHaveLength(1);
      expect(result.current.ruleSets[0].rules[0].id).toBe(RULE_ID_EDITING);
    });

    test("gives each new rule set its own ID", () => {
      const original: StoredRuleSets = [];
      const { result } = renderHook(() => useRuleSetsEdit(original, vi.fn()));

      act(() => {
        result.current.addRuleSet();
      });
      act(() => {
        result.current.addRuleSet();
      });

      const [first, second] = result.current.ruleSets.map((r) => r.id);
      expect(first).toMatch(/^[0-9a-f-]{36}$/);
      expect(second).toMatch(/^[0-9a-f-]{36}$/);
      expect(first).not.toBe(second);
    });

    test("respects existing 'My Rule Set N' naming", () => {
      const onChange = vi.fn();
      const existingRuleSets: StoredRuleSets = [
        { id: "rs-3", name: "My Rule Set 1", rules: [savedRule] },
        { id: "rs-4", name: "My Rule Set 3", rules: [savedRule] },
      ];
      const { result } = renderHook(() =>
        useRuleSetsEdit(existingRuleSets, onChange)
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
      const { result } = renderHook(() =>
        useRuleSetsEdit(sampleRuleSets, onChange)
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
      const { result } = renderHook(() =>
        useRuleSetsEdit(sampleRuleSets, onChange)
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
      const { result } = renderHook(() =>
        useRuleSetsEdit(sampleRuleSets, onChange)
      );

      act(() => {
        result.current.updateRules([], 0);
      });

      expect(result.current.ruleSets).toHaveLength(1);
      expect(result.current.ruleSets[0].name).toBe("Allow Trusted");
      expect(result.current.entries.map((e) => e.key)).toEqual([2]);
      expect(onChange).toHaveBeenCalledWith([sampleRuleSets[1]]);
    });

    test("removes a new rule set without calling onChange when its first rule is canceled", () => {
      const onChange = vi.fn();
      const original = [sampleRuleSets[0]];
      const { result } = renderHook(() => useRuleSetsEdit(original, onChange));

      act(() => {
        result.current.addRuleSet();
      });
      act(() => {
        result.current.updateRules([], 1);
      });

      expect(result.current.ruleSets).toEqual([sampleRuleSets[0]]);
      expect(onChange).not.toHaveBeenCalled();
    });

    test("filters out RULE_ID_EDITING rules when calling onChange", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useRuleSetsEdit(sampleRuleSets, onChange)
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
      const { result } = renderHook(() =>
        useRuleSetsEdit(sampleRuleSets, onChange)
      );

      act(() => {
        result.current.removeRuleSet(0);
      });

      expect(result.current.ruleSets).toHaveLength(1);
      expect(result.current.ruleSets[0].name).toBe("Allow Trusted");
      expect(result.current.entries.map((e) => e.key)).toEqual([2]);
      expect(onChange).toHaveBeenCalled();
    });

    test("removes rule set with only RULE_ID_EDITING rules without calling onChange", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useRuleSetsEdit([sampleRuleSets[0]], onChange)
      );

      act(() => {
        result.current.addRuleSet();
      });
      act(() => {
        result.current.removeRuleSet(1);
      });

      expect(result.current.ruleSets).toHaveLength(1);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("updateRuleSetTitle", () => {
    test("updates rule set name", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useRuleSetsEdit(sampleRuleSets, onChange)
      );

      act(() => {
        result.current.updateRuleSetTitle("New Title", 0);
      });

      expect(result.current.ruleSets[0].name).toBe("New Title");
      expect(onChange).toHaveBeenCalled();
    });

    test("preserves rules when updating title", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useRuleSetsEdit(sampleRuleSets, onChange)
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
      const { result, rerender } = renderHook(
        ({ ruleSets }) =>
          useRuleSetsEdit(ruleSets, onChange),
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
        { id: "rs-5", name: "Block Ads", rules: [savedRule] },
        { id: "rs-6", name: "Allow Trusted", rules: [{ ...savedRule, id: 2 }] },
      ];

      rerender({ ruleSets: updatedRuleSets });

      // Editing rule should be preserved
      expect(result.current.ruleSets[0].rules).toHaveLength(2);
      expect(result.current.ruleSets[0].rules[1].id).toBe(RULE_ID_EDITING);
    });

    test("does not merge when ruleSets is empty (initial load)", () => {
      const onChange = vi.fn();
      const { result, rerender } = renderHook(
        ({ ruleSets }) =>
          useRuleSetsEdit(ruleSets, onChange),
        { initialProps: { ruleSets: [] as StoredRuleSets } }
      );

      expect(result.current.ruleSets).toHaveLength(0);

      // Provide initial data
      rerender({ ruleSets: sampleRuleSets });

      expect(result.current.ruleSets).toEqual(sampleRuleSets);
    });
  })

  describe("tracking rule sets across updates", () => {
    const ruleSetA = { id: "rs-a", name: "A", rules: [savedRule] };
    const ruleSetB = {
      id: "rs-b",
      name: "B",
      rules: [{ ...savedRule, id: 2 }],
    };
    const imported = {
      id: "rs-imported",
      name: "Imported", rules: [{ ...savedRule, id: 3 }] };

    function render(initial: StoredRuleSets) {
      const onChange = vi.fn();
      const hook = renderHook(
        ({ ruleSets }) => useRuleSetsEdit(ruleSets, onChange),
        { initialProps: { ruleSets: initial } }
      );
      return { ...hook, onChange };
    }

    const names = (ruleSets: StoredRuleSets) => ruleSets.map((r) => r.name);

    test("keeps a new rule set apart from rule sets imported while it is edited", () => {
      const { result, rerender, onChange } = render([ruleSetA]);
      act(() => {
        result.current.addRuleSet();
      });
      const newKey = result.current.entries[1].key;

      rerender({ ruleSets: [ruleSetA, imported] });

      expect(names(result.current.ruleSets)).toEqual([
        "A",
        "My Rule Set 1",
        "Imported",
      ]);
      expect(result.current.ruleSets[1].rules).toEqual([editingRule]);
      expect(result.current.ruleSets[2]).toEqual(imported);
      expect(result.current.entries[1].key).toBe(newKey);
      expect(result.current.entries[2].key).not.toBe(newKey);

      // Cancel the new rule set
      act(() => {
        result.current.updateRules([], 1);
      });

      expect(result.current.ruleSets).toEqual([ruleSetA, imported]);
      expect(onChange).not.toHaveBeenCalled();
    });

    test("keeps an unsaved rule set in place when a later one is saved", () => {
      const { result, rerender, onChange } = render([ruleSetA]);
      act(() => {
        result.current.addRuleSet();
      });
      act(() => {
        result.current.addRuleSet();
      });
      act(() => {
        result.current.updateRules([{ ...savedRule, id: RULE_ID_UNSAVED }], 2);
      });
      expect(names(onChange.mock.lastCall![0])).toEqual(["A", "My Rule Set 2"]);

      const saved = {
        id: "rs-saved",
        name: "My Rule Set 2", rules: [{ ...savedRule, id: 5 }] };
      rerender({ ruleSets: [ruleSetA, saved] });

      expect(names(result.current.ruleSets)).toEqual([
        "A",
        "My Rule Set 1",
        "My Rule Set 2",
      ]);
      expect(result.current.ruleSets[1].rules).toEqual([editingRule]);
      expect(result.current.ruleSets[2]).toEqual(saved);
    });

    test("keeps each rule set's key when one before it is removed elsewhere", () => {
      const { result, rerender } = render([ruleSetA, ruleSetB]);
      act(() => {
        result.current.addRuleSet();
      });
      const [, keyB, keyNew] = result.current.entries.map((e) => e.key);

      rerender({ ruleSets: [ruleSetB] });

      expect(names(result.current.ruleSets)).toEqual(["B", "My Rule Set 1"]);
      expect(result.current.entries.map((e) => e.key)).toEqual([keyB, keyNew]);
    });

    test("moves an unsaved rule set to the end when the one before it is removed elsewhere", () => {
      const { result, rerender } = render([ruleSetA, ruleSetB]);
      act(() => {
        result.current.addRuleSet();
      });

      rerender({ ruleSets: [ruleSetA] });

      expect(names(result.current.ruleSets)).toEqual(["A", "My Rule Set 1"]);
    });

    test("keeps an unsaved rule set first when rule sets are stored after it", () => {
      const { result, rerender } = render([]);
      act(() => {
        result.current.addRuleSet();
      });

      rerender({ ruleSets: [imported] });

      expect(names(result.current.ruleSets)).toEqual([
        "My Rule Set 1",
        "Imported",
      ]);
    });

    test("matches a rule set replaced by name, as an import does", () => {
      const { result, rerender } = render([ruleSetA, ruleSetB]);
      const keys = result.current.entries.map((e) => e.key);

      const replacedB = {
        id: "rs-b",
        name: "B",
        rules: [{ ...savedRule, id: 9 }],
      };
      rerender({ ruleSets: [ruleSetA, replacedB] });

      expect(result.current.ruleSets).toEqual([ruleSetA, replacedB]);
      expect(result.current.entries.map((e) => e.key)).toEqual(keys);
    });

    test("opens only a rule set that is alone when the list is first filled, or added", () => {
      const single = render([]);
      single.rerender({ ruleSets: [ruleSetA] });
      expect(single.result.current.entries.map((e) => e.open)).toEqual([true]);

      const several = render([ruleSetA, ruleSetB]);
      act(() => {
        several.result.current.addRuleSet();
      });
      several.rerender({ ruleSets: [ruleSetA, ruleSetB, imported] });
      expect(several.result.current.entries.map((e) => e.open)).toEqual([
        false,
        false,
        true,
        false,
      ]);
    });
  });

  describe("onChange filtering", () => {
    test("filters out rule sets with only RULE_ID_EDITING rules", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useRuleSetsEdit(sampleRuleSets, onChange)
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
