import { describe, expect, it } from "vitest";
import { validateRule } from "./Rule";

describe("validateRule: Rule#action", () => {
  const validCondition = {
    requestDomains: ["www.example.com"],
  };
  describe("Rule `action' field", () => {
    it("[invalid] not specified", () => {
      const rule = { condition: validCondition };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: false,
        errors: [{ message: "must have required property 'action'" }],
      });
    });

    it("[invalid] not object", () => {
      const rule = { action: [], condition: validCondition };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleField: "action",
            message: "must be object",
          },
        ],
      });
    });
  });

  describe("Rule `action.type' field", () => {
    const validActions = ["block", "allow"];
    validActions.forEach((actionType) => {
      it(`[valid] '${actionType}'`, () => {
        const rule = {
          action: { type: actionType },
          condition: validCondition,
        };
        const result = validateRule(rule);
        expect(result).toStrictEqual({
          valid: true,
          evaluated: rule,
        });
      });
    });

    const invalidActions = ["", "invalid"];
    invalidActions.forEach((actionType) => {
      it(`[invalid] '${actionType}'`, () => {
        const rule = {
          action: { type: actionType },
          condition: validCondition,
        };
        const result = validateRule(rule);
        expect(result).toStrictEqual({
          valid: false,
          errors: [
            {
              ruleField: "action.type",
              message: "must be either 'block' or 'allow'",
            },
          ],
        });
      });
    });

    it(`[invalid] not specified`, () => {
      const rule = {
        action: {},
        condition: validCondition,
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleField: "action",
            message: "must have required property 'type'",
          },
        ],
      });
    });
  });
});
