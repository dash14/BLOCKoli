import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { RuleActionType } from "@/modules/core/rules";
import {
  RULE_ID_EDITING,
  RULE_ID_UNSAVED,
  StoredRule,
} from "@/modules/rules/stored";
import { useRulesEdit } from "./useRulesEdit";

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

describe("useRulesEdit", () => {
  describe("isAllowAdd state", () => {
    test("isAllowAdd is true when no editing rules exist", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useRulesEdit([savedRule], onChange)
      );

      expect(result.current.isAllowAdd).toBe(true);
    });

    test("isAllowAdd is false when RULE_ID_EDITING rule exists", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useRulesEdit([savedRule, editingRule], onChange)
      );

      expect(result.current.isAllowAdd).toBe(false);
    });

    test("isAllowAdd updates when rules change", () => {
      const onChange = vi.fn();
      const { result, rerender } = renderHook(
        ({ rules }) => useRulesEdit(rules, onChange),
        { initialProps: { rules: [savedRule] } }
      );

      expect(result.current.isAllowAdd).toBe(true);

      // Add editing rule
      rerender({ rules: [savedRule, editingRule] });
      expect(result.current.isAllowAdd).toBe(false);

      // Remove editing rule
      rerender({ rules: [savedRule] });
      expect(result.current.isAllowAdd).toBe(true);
    });
  });

  describe("addRule", () => {
    test("adds new rule with RULE_ID_EDITING", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useRulesEdit([savedRule], onChange)
      );

      act(() => {
        result.current.addRule();
      });

      expect(onChange).toHaveBeenCalledTimes(1);
      const newRules = onChange.mock.calls[0][0] as StoredRule[];
      expect(newRules).toHaveLength(2);
      expect(newRules[1].id).toBe(RULE_ID_EDITING);
      expect(newRules[1].action.type).toBe(RuleActionType.BLOCK);
    });

    test("adds rule to empty list", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useRulesEdit([], onChange));

      act(() => {
        result.current.addRule();
      });

      expect(onChange).toHaveBeenCalledTimes(1);
      const newRules = onChange.mock.calls[0][0] as StoredRule[];
      expect(newRules).toHaveLength(1);
      expect(newRules[0].id).toBe(RULE_ID_EDITING);
    });
  });

  describe("updateRule", () => {
    test("replaces rule at specified index", () => {
      const onChange = vi.fn();
      const rules: StoredRule[] = [savedRule, { ...savedRule, id: 2 }];
      const { result } = renderHook(() => useRulesEdit(rules, onChange));

      const updatedRule: StoredRule = {
        id: 2,
        action: { type: RuleActionType.ALLOW },
        condition: { requestDomains: ["updated.com"] },
      };

      act(() => {
        result.current.updateRule(updatedRule, 1);
      });

      expect(onChange).toHaveBeenCalledTimes(1);
      const newRules = onChange.mock.calls[0][0] as StoredRule[];
      expect(newRules[1].action.type).toBe(RuleActionType.ALLOW);
      expect(newRules[1].condition.requestDomains).toContain("updated.com");
    });

    test("changes RULE_ID_EDITING to RULE_ID_UNSAVED when updating", () => {
      const onChange = vi.fn();
      const rules: StoredRule[] = [savedRule, editingRule];
      const { result } = renderHook(() => useRulesEdit(rules, onChange));

      const updatedRule: StoredRule = {
        id: RULE_ID_EDITING,
        action: { type: RuleActionType.BLOCK },
        condition: { requestDomains: ["new.com"] },
      };

      act(() => {
        result.current.updateRule(updatedRule, 1);
      });

      expect(onChange).toHaveBeenCalledTimes(1);
      const newRules = onChange.mock.calls[0][0] as StoredRule[];
      expect(newRules[1].id).toBe(RULE_ID_UNSAVED);
    });

    test("preserves existing rule ID when not RULE_ID_EDITING", () => {
      const onChange = vi.fn();
      const rules: StoredRule[] = [savedRule];
      const { result } = renderHook(() => useRulesEdit(rules, onChange));

      const updatedRule: StoredRule = {
        id: 1,
        action: { type: RuleActionType.ALLOW },
        condition: { requestDomains: ["example.com"] },
      };

      act(() => {
        result.current.updateRule(updatedRule, 0);
      });

      const newRules = onChange.mock.calls[0][0] as StoredRule[];
      expect(newRules[0].id).toBe(1);
    });
  });

  describe("removeRule", () => {
    test("removes rule at specified index", () => {
      const onChange = vi.fn();
      const rules: StoredRule[] = [savedRule, { ...savedRule, id: 2 }];
      const { result } = renderHook(() => useRulesEdit(rules, onChange));

      act(() => {
        result.current.removeRule(0);
      });

      expect(onChange).toHaveBeenCalledTimes(1);
      const newRules = onChange.mock.calls[0][0] as StoredRule[];
      expect(newRules).toHaveLength(1);
      expect(newRules[0].id).toBe(2);
    });

    test("removes RULE_ID_EDITING rule by calling cancelEdit", () => {
      const onChange = vi.fn();
      const rules: StoredRule[] = [savedRule, editingRule];
      const { result } = renderHook(() => useRulesEdit(rules, onChange));

      act(() => {
        result.current.removeRule(1);
      });

      // cancelEdit removes the editing rule
      expect(onChange).toHaveBeenCalledTimes(1);
      const newRules = onChange.mock.calls[0][0] as StoredRule[];
      expect(newRules).toHaveLength(1);
      expect(newRules[0].id).toBe(savedRule.id);
    });
  });

  describe("cancelEdit", () => {
    test("removes RULE_ID_EDITING rule", () => {
      const onChange = vi.fn();
      const rules: StoredRule[] = [savedRule, editingRule];
      const { result } = renderHook(() => useRulesEdit(rules, onChange));

      act(() => {
        result.current.cancelEdit(1);
      });

      expect(onChange).toHaveBeenCalledTimes(1);
      const newRules = onChange.mock.calls[0][0] as StoredRule[];
      expect(newRules).toHaveLength(1);
      expect(newRules[0].id).toBe(savedRule.id);
    });

    test("does nothing when rule is not RULE_ID_EDITING", () => {
      const onChange = vi.fn();
      const rules: StoredRule[] = [savedRule, { ...savedRule, id: 2 }];
      const { result } = renderHook(() => useRulesEdit(rules, onChange));

      act(() => {
        result.current.cancelEdit(1);
      });

      // onChange should not be called for non-editing rule
      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
