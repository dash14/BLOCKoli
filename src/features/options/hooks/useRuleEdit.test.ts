import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  RequestMethod,
  ResourceType,
  Rule,
  RuleActionType,
} from "@/modules/core/rules";

// Mock createRegexValidator before importing useRuleEdit
// This is necessary because useRuleEdit creates RuleValidator at module level
// vi.hoisted ensures the mock is defined before vi.mock runs
const mockIsRegexSupported = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ isSupported: true })
);

vi.mock("@/modules/chrome/regex", () => ({
  createRegexValidator: () => mockIsRegexSupported,
}));

import { useRuleEdit } from "./useRuleEdit";

beforeEach(() => {
  mockIsRegexSupported.mockResolvedValue({ isSupported: true });
});

afterEach(() => {
  mockIsRegexSupported.mockClear();
});

// Test data: valid rule with condition
const validRule: Rule = {
  action: { type: RuleActionType.BLOCK },
  condition: { requestDomains: ["example.com"] },
};

// Test data: invalid rule (no conditions)
const invalidRule: Rule = {
  action: { type: RuleActionType.BLOCK },
  condition: {},
};

// Test data: rule with all fields
const fullRule: Rule = {
  action: { type: RuleActionType.ALLOW },
  condition: {
    requestDomains: ["example.com"],
    initiatorDomains: ["trusted.com"],
    urlFilter: "ads",
    resourceTypes: [ResourceType.SCRIPT],
    requestMethods: [RequestMethod.GET],
  },
};

describe("useRuleEdit", () => {
  describe("initial state", () => {
    test("valid rule starts in view mode (isEditing: false)", async () => {
      const onChange = vi.fn();
      const onCancel = vi.fn();
      const onRemove = vi.fn();

      const { result } = renderHook(() =>
        useRuleEdit(validRule, onChange, onCancel, onRemove)
      );

      await waitFor(() => {
        expect(result.current.isValid).toBe(true);
      });

      expect(result.current.isEditing).toBe(false);
      expect(result.current.rule).toEqual(validRule);
    });

    test("invalid rule auto-enters edit mode", async () => {
      const onChange = vi.fn();
      const onCancel = vi.fn();
      const onRemove = vi.fn();

      const { result } = renderHook(() =>
        useRuleEdit(invalidRule, onChange, onCancel, onRemove)
      );

      await waitFor(() => {
        expect(result.current.isEditing).toBe(true);
      });

      expect(result.current.isValid).toBe(false);
    });

    test("updates rule when initialRule prop changes", async () => {
      const onChange = vi.fn();
      const onCancel = vi.fn();
      const onRemove = vi.fn();

      const { result, rerender } = renderHook(
        ({ rule }) => useRuleEdit(rule, onChange, onCancel, onRemove),
        { initialProps: { rule: validRule } }
      );

      await waitFor(() => {
        expect(result.current.isValid).toBe(true);
      });

      expect(result.current.rule).toEqual(validRule);

      // Change initialRule prop (simulates import scenario)
      const newRule: Rule = {
        action: { type: RuleActionType.ALLOW },
        condition: { requestDomains: ["newdomain.com"] },
      };

      rerender({ rule: newRule });

      await waitFor(() => {
        expect(result.current.rule).toEqual(newRule);
      });

      expect(result.current.rule.action.type).toBe(RuleActionType.ALLOW);
      expect(result.current.rule.condition.requestDomains).toEqual([
        "newdomain.com",
      ]);
    });

    test("validates the new rule when initialRule changes", async () => {
      const { result, rerender } = renderHook(
        ({ rule }) => useRuleEdit(rule, vi.fn(), vi.fn(), vi.fn()),
        { initialProps: { rule: validRule } }
      );

      await waitFor(() => {
        expect(result.current.isValid).toBe(true);
      });
      expect(result.current.isEditing).toBe(false);

      rerender({ rule: invalidRule });

      await waitFor(() => {
        expect(result.current.isValid).toBe(false);
      });
      expect(result.current.isEditing).toBe(true);
    });
  });

  describe("enterEditMode", () => {
    test("sets isEditing to true", async () => {
      const onChange = vi.fn();
      const onCancel = vi.fn();
      const onRemove = vi.fn();

      const { result } = renderHook(() =>
        useRuleEdit(validRule, onChange, onCancel, onRemove)
      );

      await waitFor(() => {
        expect(result.current.isValid).toBe(true);
      });

      act(() => {
        result.current.enterEditMode();
      });

      expect(result.current.isEditing).toBe(true);
    });
  });

  describe("updateAction", () => {
    test("changes action type", async () => {
      const onChange = vi.fn();
      const onCancel = vi.fn();
      const onRemove = vi.fn();

      const { result } = renderHook(() =>
        useRuleEdit(validRule, onChange, onCancel, onRemove)
      );

      await waitFor(() => {
        expect(result.current.isValid).toBe(true);
      });

      act(() => {
        result.current.updateAction(RuleActionType.ALLOW);
      });

      await waitFor(() => {
        expect(result.current.rule.action.type).toBe(RuleActionType.ALLOW);
      });
    });
  });

  describe("updateRequestDomains", () => {
    test("updates request domains", async () => {
      const onChange = vi.fn();
      const onCancel = vi.fn();
      const onRemove = vi.fn();

      const { result } = renderHook(() =>
        useRuleEdit(validRule, onChange, onCancel, onRemove)
      );

      await waitFor(() => {
        expect(result.current.isValid).toBe(true);
      });

      act(() => {
        result.current.updateRequestDomains(["new.com", "another.com"]);
      });

      await waitFor(() => {
        expect(result.current.rule.condition.requestDomains).toEqual([
          "new.com",
          "another.com",
        ]);
      });
    });
  });

  describe("updateInitiatorDomains", () => {
    test("updates initiator domains", async () => {
      const onChange = vi.fn();
      const onCancel = vi.fn();
      const onRemove = vi.fn();

      const { result } = renderHook(() =>
        useRuleEdit(validRule, onChange, onCancel, onRemove)
      );

      await waitFor(() => {
        expect(result.current.isValid).toBe(true);
      });

      act(() => {
        result.current.updateInitiatorDomains(["initiator.com"]);
      });

      await waitFor(() => {
        expect(result.current.rule.condition.initiatorDomains).toEqual([
          "initiator.com",
        ]);
      });
    });
  });

  describe("updateUrlFilter", () => {
    test("updates URL filter", async () => {
      const onChange = vi.fn();
      const onCancel = vi.fn();
      const onRemove = vi.fn();

      const { result } = renderHook(() =>
        useRuleEdit(validRule, onChange, onCancel, onRemove)
      );

      await waitFor(() => {
        expect(result.current.isValid).toBe(true);
      });

      act(() => {
        result.current.updateUrlFilter("||ads.com^");
      });

      await waitFor(() => {
        expect(result.current.rule.condition.urlFilter).toBe("||ads.com^");
      });
    });
  });

  describe("updateIsRegexFilter", () => {
    test("toggles regex mode", async () => {
      const onChange = vi.fn();
      const onCancel = vi.fn();
      const onRemove = vi.fn();

      const { result } = renderHook(() =>
        useRuleEdit(validRule, onChange, onCancel, onRemove)
      );

      await waitFor(() => {
        expect(result.current.isValid).toBe(true);
      });

      act(() => {
        result.current.updateIsRegexFilter(true);
      });

      await waitFor(() => {
        expect(result.current.rule.condition.isRegexFilter).toBe(true);
      });
    });
  });

  describe("updateResourceTypes", () => {
    test("updates resource types", async () => {
      const onChange = vi.fn();
      const onCancel = vi.fn();
      const onRemove = vi.fn();

      const { result } = renderHook(() =>
        useRuleEdit(validRule, onChange, onCancel, onRemove)
      );

      await waitFor(() => {
        expect(result.current.isValid).toBe(true);
      });

      act(() => {
        result.current.updateResourceTypes([
          ResourceType.IMAGE,
          ResourceType.SCRIPT,
        ]);
      });

      await waitFor(() => {
        expect(result.current.rule.condition.resourceTypes).toEqual([
          ResourceType.IMAGE,
          ResourceType.SCRIPT,
        ]);
      });
    });
  });

  describe("updateRequestMethods", () => {
    test("updates request methods", async () => {
      const onChange = vi.fn();
      const onCancel = vi.fn();
      const onRemove = vi.fn();

      const { result } = renderHook(() =>
        useRuleEdit(validRule, onChange, onCancel, onRemove)
      );

      await waitFor(() => {
        expect(result.current.isValid).toBe(true);
      });

      act(() => {
        result.current.updateRequestMethods([
          RequestMethod.GET,
          RequestMethod.POST,
        ]);
      });

      await waitFor(() => {
        expect(result.current.rule.condition.requestMethods).toEqual([
          RequestMethod.GET,
          RequestMethod.POST,
        ]);
      });
    });
  });

  describe("save", () => {
    test("calls onChange and exits edit mode", async () => {
      const onChange = vi.fn();
      const onCancel = vi.fn();
      const onRemove = vi.fn();

      const { result } = renderHook(() =>
        useRuleEdit(validRule, onChange, onCancel, onRemove)
      );

      await waitFor(() => {
        expect(result.current.isValid).toBe(true);
      });

      act(() => {
        result.current.enterEditMode();
      });

      act(() => {
        result.current.updateRequestDomains(["updated.com"]);
      });

      await waitFor(() => {
        expect(result.current.rule.condition.requestDomains).toContain(
          "updated.com"
        );
      });

      await act(async () => {
        await result.current.save();
      });

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(result.current.isEditing).toBe(false);
      expect(onChange.mock.calls[0][0].condition.requestDomains).toContain(
        "updated.com"
      );
    });
  });

  describe("cancel", () => {
    test("resets to initial rule and calls onCancel", async () => {
      const onChange = vi.fn();
      const onCancel = vi.fn();
      const onRemove = vi.fn();

      const { result } = renderHook(() =>
        useRuleEdit(validRule, onChange, onCancel, onRemove)
      );

      await waitFor(() => {
        expect(result.current.isValid).toBe(true);
      });

      act(() => {
        result.current.enterEditMode();
      });

      act(() => {
        result.current.updateRequestDomains(["changed.com"]);
      });

      await waitFor(() => {
        expect(result.current.rule.condition.requestDomains).toContain(
          "changed.com"
        );
      });

      act(() => {
        result.current.cancel();
      });

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(result.current.isEditing).toBe(false);
      // Rule should be reset to initial
      expect(result.current.rule.condition.requestDomains).toEqual(
        validRule.condition.requestDomains
      );
    });
  });

  describe("remove", () => {
    test("calls onRemove", async () => {
      const onChange = vi.fn();
      const onCancel = vi.fn();
      const onRemove = vi.fn();

      const { result } = renderHook(() =>
        useRuleEdit(validRule, onChange, onCancel, onRemove)
      );

      await waitFor(() => {
        expect(result.current.isValid).toBe(true);
      });

      act(() => {
        result.current.remove();
      });

      expect(onRemove).toHaveBeenCalledTimes(1);
    });
  });

  describe("validation", () => {
    test("shows error when all conditions are empty", async () => {
      const onChange = vi.fn();
      const onCancel = vi.fn();
      const onRemove = vi.fn();

      const { result } = renderHook(() =>
        useRuleEdit(invalidRule, onChange, onCancel, onRemove)
      );

      await waitFor(() => {
        expect(result.current.isValid).toBe(false);
        // isValid is false for empty conditions
        // Note: validation error is stored in "condition" field, not individual fields
        expect(result.current.isEditing).toBe(true);
      });
    });

    test("shows error for invalid regex syntax", async () => {
      const onChange = vi.fn();
      const onCancel = vi.fn();
      const onRemove = vi.fn();

      // Invalid JavaScript regex syntax - this is validated by Rule.ts validateRegexpFilter
      const ruleWithInvalidRegex: Rule = {
        action: { type: RuleActionType.BLOCK },
        condition: {
          urlFilter: "[invalid",
          isRegexFilter: true,
        },
      };

      const { result } = renderHook(() =>
        useRuleEdit(ruleWithInvalidRegex, onChange, onCancel, onRemove)
      );

      await waitFor(() => {
        expect(result.current.isValid).toBe(false);
        // Invalid regex triggers edit mode
        expect(result.current.isEditing).toBe(true);
      });
    });

    test("valid rule with urlFilter passes validation", async () => {
      const onChange = vi.fn();
      const onCancel = vi.fn();
      const onRemove = vi.fn();

      const ruleWithUrlFilter: Rule = {
        action: { type: RuleActionType.BLOCK },
        condition: { urlFilter: "||ads.com^" },
      };

      const { result } = renderHook(() =>
        useRuleEdit(ruleWithUrlFilter, onChange, onCancel, onRemove)
      );

      await waitFor(() => {
        expect(result.current.isValid).toBe(true);
      });

      expect(result.current.isEditing).toBe(false);
    });

    test("clears validation errors after fixing", async () => {
      const onChange = vi.fn();
      const onCancel = vi.fn();
      const onRemove = vi.fn();

      const { result } = renderHook(() =>
        useRuleEdit(invalidRule, onChange, onCancel, onRemove)
      );

      await waitFor(() => {
        expect(result.current.isValid).toBe(false);
      });

      // Add valid condition
      act(() => {
        result.current.updateRequestDomains(["example.com"]);
      });

      await waitFor(() => {
        expect(result.current.isValid).toBe(true);
      });

      // Errors should be cleared
      const hasErrors = Object.values(result.current.validationErrors).some(
        (errors) => errors.length > 0
      );
      expect(hasErrors).toBe(false);
    });

    describe("results arriving out of order", () => {
      const regexRule: Rule = {
        action: { type: RuleActionType.BLOCK },
        condition: { urlFilter: "a", isRegexFilter: true },
      };

      // Holds isRegexSupported until resolve() is called with the regex
      function holdRegexChecks() {
        const pending: { regex: string; resolve: () => void }[] = [];
        mockIsRegexSupported.mockImplementation(
          (regex: string) =>
            new Promise((resolve) => {
              pending.push({
                regex,
                resolve: () =>
                  resolve({
                    isSupported: regex === "a",
                    reason: "syntaxError",
                  }),
              });
            })
        );
        return async (regex: string) => {
          await act(async () => {
            pending
              .filter((p) => p.regex === regex)
              .forEach((p) => p.resolve());
          });
        };
      }

      test("keeps the result of the latest input", async () => {
        const resolve = holdRegexChecks();
        const { result } = renderHook(() =>
          useRuleEdit(regexRule, vi.fn(), vi.fn(), vi.fn())
        );

        act(() => {
          result.current.updateUrlFilter("b");
        });
        await resolve("b");
        // The initial check finishes last but is older
        await resolve("a");

        expect(result.current.isValid).toBe(false);
        expect(result.current.validationErrors.urlFilter).toEqual([
          "syntaxError",
        ]);
      });

      test("shows the errors of a new initialRule", async () => {
        const resolve = holdRegexChecks();
        const { result, rerender } = renderHook(
          ({ rule }) => useRuleEdit(rule, vi.fn(), vi.fn(), vi.fn()),
          { initialProps: { rule: regexRule } }
        );
        await resolve("a");
        expect(result.current.validationErrors.urlFilter).toEqual([]);

        rerender({
          rule: {
            ...regexRule,
            condition: { ...regexRule.condition, urlFilter: "b" },
          },
        });
        await resolve("b");

        expect(result.current.validationErrors.urlFilter).toEqual([
          "syntaxError",
        ]);
        expect(result.current.isEditing).toBe(true);
      });

      test("ignores an earlier input whose check finishes later", async () => {
        const resolve = holdRegexChecks();
        const { result } = renderHook(() =>
          useRuleEdit(regexRule, vi.fn(), vi.fn(), vi.fn())
        );
        await resolve("a");

        act(() => {
          result.current.updateUrlFilter("b");
        });
        act(() => {
          result.current.updateUrlFilter("a");
        });
        await resolve("a");
        await resolve("b");

        expect(result.current.isValid).toBe(true);
      });

      test("save checks the rule again instead of using a stale isValid", async () => {
        const resolve = holdRegexChecks();
        const onChange = vi.fn();
        const { result } = renderHook(() =>
          useRuleEdit(regexRule, onChange, vi.fn(), vi.fn())
        );
        await resolve("a");
        expect(result.current.isValid).toBe(true);

        act(() => {
          result.current.enterEditMode();
        });
        act(() => {
          result.current.updateUrlFilter("b");
        });
        let saving!: Promise<void>;
        act(() => {
          saving = result.current.save();
        });
        await resolve("b");
        await act(() => saving);

        expect(onChange).not.toHaveBeenCalled();
        expect(result.current.isEditing).toBe(true);
        expect(result.current.isValid).toBe(false);
      });

      test("does not save a rule removed while its check runs", async () => {
        const resolve = holdRegexChecks();
        const onChange = vi.fn();
        const { result, unmount } = renderHook(() =>
          useRuleEdit(regexRule, onChange, vi.fn(), vi.fn())
        );
        await resolve("a");

        act(() => {
          result.current.updateUrlFilter("a");
        });
        let saving!: Promise<void>;
        act(() => {
          saving = result.current.save();
        });
        unmount();
        await resolve("a");
        await saving;

        expect(onChange).not.toHaveBeenCalled();
      });

      test("calls the latest onChange after waiting on the check", async () => {
        const resolve = holdRegexChecks();
        const first = vi.fn();
        const latest = vi.fn();
        const { result, rerender } = renderHook(
          ({ onChange }) => useRuleEdit(regexRule, onChange, vi.fn(), vi.fn()),
          { initialProps: { onChange: first } }
        );
        await resolve("a");

        act(() => {
          result.current.updateUrlFilter("a");
        });
        let saving!: Promise<void>;
        act(() => {
          saving = result.current.save();
        });
        rerender({ onChange: latest });
        await resolve("a");
        await act(() => saving);

        expect(first).not.toHaveBeenCalled();
        expect(latest).toHaveBeenCalledWith(regexRule);
      });

      test("saves without checking again when the rule was already checked", async () => {
        const resolve = holdRegexChecks();
        const onChange = vi.fn();
        const { result } = renderHook(() =>
          useRuleEdit(regexRule, onChange, vi.fn(), vi.fn())
        );
        await resolve("a");
        mockIsRegexSupported.mockClear();

        act(() => {
          void result.current.save();
        });

        expect(onChange).toHaveBeenCalledWith(regexRule);
        expect(mockIsRegexSupported).not.toHaveBeenCalled();
      });

      test("checks a rule known to be invalid again on save", async () => {
        const resolve = holdRegexChecks();
        const onChange = vi.fn();
        const rejectedRule: Rule = {
          ...regexRule,
          condition: { ...regexRule.condition, urlFilter: "b" },
        };
        const { result } = renderHook(() =>
          useRuleEdit(rejectedRule, onChange, vi.fn(), vi.fn())
        );
        await resolve("b");
        mockIsRegexSupported.mockClear();

        let saving!: Promise<void>;
        act(() => {
          saving = result.current.save();
        });
        await resolve("b");
        await act(() => saving);

        expect(mockIsRegexSupported).toHaveBeenCalledTimes(1);
        expect(onChange).not.toHaveBeenCalled();
      });
    });
  });

  describe("full rule editing", () => {
    test("can edit all fields of a complete rule", async () => {
      const onChange = vi.fn();
      const onCancel = vi.fn();
      const onRemove = vi.fn();

      const { result } = renderHook(() =>
        useRuleEdit(fullRule, onChange, onCancel, onRemove)
      );

      await waitFor(() => {
        expect(result.current.isValid).toBe(true);
      });

      // Verify initial state
      expect(result.current.rule.action.type).toBe(RuleActionType.ALLOW);
      expect(result.current.rule.condition.requestDomains).toEqual([
        "example.com",
      ]);
      expect(result.current.rule.condition.initiatorDomains).toEqual([
        "trusted.com",
      ]);
      expect(result.current.rule.condition.urlFilter).toBe("ads");
      expect(result.current.rule.condition.resourceTypes).toEqual([
        ResourceType.SCRIPT,
      ]);
      expect(result.current.rule.condition.requestMethods).toEqual([
        RequestMethod.GET,
      ]);
    });
  });
});
