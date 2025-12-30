import { describe, expect, it, vi } from "vitest";
import type { RegexValidator } from "@/modules/core/regex";
import { RuleActionType } from "@/modules/core/rules";
import type { Rule } from "@/modules/core/rules";
import { RuleValidator } from "./edit";

describe("RuleValidator", () => {
  const createMockRegexValidator = (
    isSupported: boolean,
    reason?: string
  ): RegexValidator => {
    return vi.fn().mockResolvedValue({ isSupported, reason });
  };

  describe("constructor", () => {
    it("creates instance with regexValidator", () => {
      const mockValidator = createMockRegexValidator(true);
      const validator = new RuleValidator(mockValidator);

      expect(validator).toBeInstanceOf(RuleValidator);
    });
  });

  describe("validate", () => {
    it("returns valid result for valid rule", async () => {
      const mockValidator = createMockRegexValidator(true);
      const validator = new RuleValidator(mockValidator);

      const rule: Rule = {
        action: { type: RuleActionType.BLOCK },
        condition: {
          requestDomains: ["example.com"],
        },
      };

      const result = await validator.validate(rule);

      expect(result.valid).toBe(true);
      if (result.valid) {
        expect(result.evaluated).toEqual(rule);
      }
    });

    it("returns invalid result for invalid rule", async () => {
      const mockValidator = createMockRegexValidator(true);
      const validator = new RuleValidator(mockValidator);

      const rule = {
        action: { type: "invalid" },
        condition: {},
      } as unknown as Rule;

      const result = await validator.validate(rule);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    it("returns invalid result for empty condition", async () => {
      const mockValidator = createMockRegexValidator(true);
      const validator = new RuleValidator(mockValidator);

      const rule: Rule = {
        action: { type: RuleActionType.BLOCK },
        condition: {},
      };

      const result = await validator.validate(rule);

      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors).toContainEqual({
          ruleField: "condition",
          message: "must contain at least one rule",
        });
      }
    });

    describe("regex validation", () => {
      it("calls regexValidator when isRegexFilter is true", async () => {
        const mockValidator = createMockRegexValidator(true);
        const validator = new RuleValidator(mockValidator);

        const rule: Rule = {
          action: { type: RuleActionType.BLOCK },
          condition: {
            urlFilter: ".*\\.js$",
            isRegexFilter: true,
          },
        };

        await validator.validate(rule);

        expect(mockValidator).toHaveBeenCalledWith(".*\\.js$", true);
      });

      it("does not call regexValidator when isRegexFilter is false", async () => {
        const mockValidator = createMockRegexValidator(true);
        const validator = new RuleValidator(mockValidator);

        const rule: Rule = {
          action: { type: RuleActionType.BLOCK },
          condition: {
            urlFilter: "*://example.com/*",
            isRegexFilter: false,
          },
        };

        await validator.validate(rule);

        expect(mockValidator).not.toHaveBeenCalled();
      });

      it("does not call regexValidator when isRegexFilter is undefined", async () => {
        const mockValidator = createMockRegexValidator(true);
        const validator = new RuleValidator(mockValidator);

        const rule: Rule = {
          action: { type: RuleActionType.BLOCK },
          condition: {
            urlFilter: "*://example.com/*",
          },
        };

        await validator.validate(rule);

        expect(mockValidator).not.toHaveBeenCalled();
      });

      it("does not call regexValidator when urlFilter is empty", async () => {
        const mockValidator = createMockRegexValidator(true);
        const validator = new RuleValidator(mockValidator);

        const rule: Rule = {
          action: { type: RuleActionType.BLOCK },
          condition: {
            requestDomains: ["example.com"],
            isRegexFilter: true,
          },
        };

        await validator.validate(rule);

        expect(mockValidator).not.toHaveBeenCalled();
      });

      it("returns valid when regexValidator returns isSupported true", async () => {
        const mockValidator = createMockRegexValidator(true);
        const validator = new RuleValidator(mockValidator);

        const rule: Rule = {
          action: { type: RuleActionType.BLOCK },
          condition: {
            urlFilter: ".*\\.js$",
            isRegexFilter: true,
          },
        };

        const result = await validator.validate(rule);

        expect(result.valid).toBe(true);
      });

      it("returns invalid when regexValidator returns isSupported false", async () => {
        const mockValidator = createMockRegexValidator(false, "syntaxError");
        const validator = new RuleValidator(mockValidator);

        // Use a regex that is valid in JavaScript but rejected by Chrome API
        const rule: Rule = {
          action: { type: RuleActionType.BLOCK },
          condition: {
            urlFilter: "test.*pattern",
            isRegexFilter: true,
          },
        };

        const result = await validator.validate(rule);

        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.errors).toContainEqual({
            ruleField: "condition.urlFilter",
            message: "syntaxError",
          });
        }
      });

      it("returns default error message when reason is undefined", async () => {
        const mockValidator = createMockRegexValidator(false, undefined);
        const validator = new RuleValidator(mockValidator);

        // Use a regex that is valid in JavaScript but rejected by Chrome API
        const rule: Rule = {
          action: { type: RuleActionType.BLOCK },
          condition: {
            urlFilter: ".*test.*",
            isRegexFilter: true,
          },
        };

        const result = await validator.validate(rule);

        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.errors).toContainEqual({
            ruleField: "condition.urlFilter",
            message: "Not supported regex",
          });
        }
      });

      it("returns memoryLimitExceeded reason", async () => {
        const mockValidator = createMockRegexValidator(
          false,
          "memoryLimitExceeded"
        );
        const validator = new RuleValidator(mockValidator);

        const rule: Rule = {
          action: { type: RuleActionType.BLOCK },
          condition: {
            urlFilter: "(.+)+",
            isRegexFilter: true,
          },
        };

        const result = await validator.validate(rule);

        expect(result.valid).toBe(false);
        if (!result.valid) {
          expect(result.errors).toContainEqual({
            ruleField: "condition.urlFilter",
            message: "memoryLimitExceeded",
          });
        }
      });
    });

    describe("combined validation", () => {
      it("validates both schema and regex", async () => {
        const mockValidator = createMockRegexValidator(true);
        const validator = new RuleValidator(mockValidator);

        const rule: Rule = {
          action: { type: RuleActionType.ALLOW },
          condition: {
            urlFilter: "^https://.*$",
            isRegexFilter: true,
            requestDomains: ["example.com"],
          },
        };

        const result = await validator.validate(rule);

        expect(result.valid).toBe(true);
        expect(mockValidator).toHaveBeenCalledWith("^https://.*$", true);
      });

      it("does not call regexValidator if schema validation fails", async () => {
        const mockValidator = createMockRegexValidator(true);
        const validator = new RuleValidator(mockValidator);

        const rule = {
          action: { type: "invalid-action" },
          condition: {
            urlFilter: ".*",
            isRegexFilter: true,
          },
        } as unknown as Rule;

        const result = await validator.validate(rule);

        expect(result.valid).toBe(false);
        expect(mockValidator).not.toHaveBeenCalled();
      });
    });
  });
});
