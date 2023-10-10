import { describe, expect, it } from "vitest";
import { Rule, RuleSet } from "@/modules/core/rules";
import { validateRuleSet } from "./RuleSet";

function ruleToRuleSet(rule: unknown): RuleSet {
  return { name: "rule set", rules: [rule as Rule] };
}

describe("validateRuleSet: RuleSet#condition", () => {
  describe("Rule `condition' field", () => {
    it("[invalid] not specified", () => {
      const targetRule = { action: { type: "block" } };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleSetField: "rules",
            ruleNumber: 0,
            message: "must have required property 'condition'",
          },
        ],
      });
    });

    it("[invalid] not object", () => {
      const targetRule = { action: { type: "block" }, condition: [] };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleSetField: "rules",
            ruleNumber: 0,
            ruleField: "condition",
            message: "must be object",
          },
        ],
      });
    });

    it("[invalid] empty", () => {
      const targetRule = {
        action: { type: "block" },
        condition: {},
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleSetField: "rules",
            ruleNumber: 0,
            message: "must contain at least one rule",
            ruleField: "condition",
          },
        ],
      });
    });

    it("[invalid] has invalid field", () => {
      const targetRule = {
        action: { type: "block" },
        condition: {
          invalid: null,
        },
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleSetField: "rules",
            ruleNumber: 0,
            message: "must NOT have additional properties",
            ruleField: "condition",
          },
        ],
      });
    });
  });

  describe("Rule `condition.requestDomains' field", () => {
    it("[valid]", () => {
      const targetRule = {
        action: { type: "block" },
        condition: {
          requestDomains: ["www.example1.com", "www.example2.com"],
        },
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: ruleSet,
      });
    });

    it("[valid] empty", () => {
      const targetRule = {
        action: { type: "block" },
        condition: { requestDomains: [] },
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: ruleSet,
      });
    });

    it("[invalid] not array", () => {
      const targetRule = {
        action: { type: "block" },
        condition: { requestDomains: {} },
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleSetField: "rules",
            ruleNumber: 0,
            ruleField: "condition.requestDomains",
            message: "must be array",
          },
        ],
      });
    });

    it("[invalid] non-ascii code", () => {
      const targetRule = {
        action: { type: "block" },
        condition: {
          requestDomains: ["www.こんにちは.com"],
        },
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleSetField: "rules",
            ruleNumber: 0,
            ruleField: "condition.requestDomains",
            message: "must not contain non-ascii code and space",
          },
        ],
      });
    });

    it("[invalid] contain space", () => {
      const targetRule = {
        action: { type: "block" },
        condition: {
          requestDomains: ["www.example .com"],
        },
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleSetField: "rules",
            ruleNumber: 0,
            ruleField: "condition.requestDomains",
            message: "must not contain non-ascii code and space",
          },
        ],
      });
    });
  });

  describe("Rule `condition.initiatorDomains' field", () => {
    it("[valid]", () => {
      const targetRule = {
        action: { type: "block" },
        condition: {
          initiatorDomains: ["www.example1.com", "www.example2.com"],
        },
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: ruleSet,
      });
    });

    it("[valid] empty", () => {
      const targetRule = {
        action: { type: "block" },
        condition: { initiatorDomains: [] },
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: ruleSet,
      });
    });

    it("[invalid] not array", () => {
      const targetRule = {
        action: { type: "block" },
        condition: { initiatorDomains: {} },
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleSetField: "rules",
            ruleNumber: 0,
            ruleField: "condition.initiatorDomains",
            message: "must be array",
          },
        ],
      });
    });

    it("[invalid] non-ascii code", () => {
      const targetRule = {
        action: { type: "block" },
        condition: {
          initiatorDomains: ["www.こんにちは.com"],
        },
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleSetField: "rules",
            ruleNumber: 0,
            ruleField: "condition.initiatorDomains",
            message: "must not contain non-ascii code and space",
          },
        ],
      });
    });

    it("[invalid] contain space", () => {
      const targetRule = {
        action: { type: "block" },
        condition: {
          initiatorDomains: ["www.example .com"],
        },
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleSetField: "rules",
            ruleNumber: 0,
            ruleField: "condition.initiatorDomains",
            message: "must not contain non-ascii code and space",
          },
        ],
      });
    });
  });

  describe("Rule `condition.urlFilter' field", () => {
    it("[valid] ascii code only", () => {
      const targetRule = {
        action: { type: "block" },
        condition: {
          urlFilter: "www.example1.com?q=test-message",
        },
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: ruleSet,
      });
    });

    it("[valid] empty", () => {
      const targetRule = {
        action: { type: "block" },
        condition: { urlFilter: "" },
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: ruleSet,
      });
    });

    it("[invalid] not string", () => {
      const targetRule = {
        action: { type: "block" },
        condition: { urlFilter: {} },
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleSetField: "rules",
            ruleNumber: 0,
            ruleField: "condition.urlFilter",
            message: "must be string",
          },
        ],
      });
    });

    it("[invalid] non-ascii code", () => {
      const targetRule = {
        action: { type: "block" },
        condition: {
          urlFilter: "q=こんにちは",
        },
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleSetField: "rules",
            ruleNumber: 0,
            ruleField: "condition.urlFilter",
            message: "must not contain non-ascii code",
          },
        ],
      });
    });
  });

  describe("Rule `condition.isRegexFilter' field", () => {
    [true, false].forEach((value) => {
      it(`[valid] ${value.toString()}`, () => {
        const targetRule = {
          action: { type: "block" },
          condition: { isRegexFilter: value },
        };
        const ruleSet = ruleToRuleSet(targetRule);
        const result = validateRuleSet(ruleSet);
        expect(result).toStrictEqual({
          valid: true,
          evaluated: ruleSet,
        });
      });
    });

    it("[invalid] not boolean", () => {
      const targetRule = {
        action: { type: "block" },
        condition: { isRegexFilter: "" },
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleSetField: "rules",
            ruleNumber: 0,
            ruleField: "condition.isRegexFilter",
            message: "must be boolean",
          },
        ],
      });
    });
  });

  describe("Rule `condition.requestMethods' field", () => {
    const requestMethods = [
      "connect",
      "delete",
      "get",
      "head",
      "options",
      "patch",
      "post",
      "put",
    ];
    requestMethods.forEach((method) => {
      it(`[valid] ${method}`, () => {
        const targetRule = {
          action: { type: "block" },
          condition: {
            requestMethods: [method],
          },
        };
        const ruleSet = ruleToRuleSet(targetRule);
        const result = validateRuleSet(ruleSet);
        expect(result).toStrictEqual({
          valid: true,
          evaluated: ruleSet,
        });
      });
    });

    it("[valid] empty", () => {
      const targetRule = {
        action: { type: "block" },
        condition: { requestMethods: [] },
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: ruleSet,
      });
    });

    it("[valid] multiple", () => {
      const targetRule = {
        action: { type: "block" },
        condition: { requestMethods: ["get", "post"] },
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: ruleSet,
      });
    });

    it("[valid] all", () => {
      const targetRule = {
        action: { type: "block" },
        condition: { requestMethods },
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: ruleSet,
      });
    });

    it("[invalid] not array", () => {
      const targetRule = {
        action: { type: "block" },
        condition: { requestMethods: "string" },
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleSetField: "rules",
            ruleNumber: 0,
            ruleField: "condition.requestMethods",
            message: "must be array",
          },
        ],
      });
    });

    it("[invalid] invalid method", () => {
      const targetRule = {
        action: { type: "block" },
        condition: { requestMethods: ["invalid"] },
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleSetField: "rules",
            ruleNumber: 0,
            ruleField: "condition.requestMethods",
            message: "must be equal to one of the allowed values",
          },
        ],
      });
    });
  });

  describe("Rule `condition.resourceTypes' field", () => {
    const resourceTypes = [
      "main_frame",
      "sub_frame",
      "stylesheet",
      "script",
      "image",
      "font",
      "object",
      "xmlhttprequest",
      "ping",
      "csp_report",
      "media",
      "websocket",
      "other",
    ];
    resourceTypes.forEach((method) => {
      it(`[valid] ${method}`, () => {
        const targetRule = {
          action: { type: "block" },
          condition: {
            resourceTypes: [method],
          },
        };
        const ruleSet = ruleToRuleSet(targetRule);
        const result = validateRuleSet(ruleSet);
        expect(result).toStrictEqual({
          valid: true,
          evaluated: ruleSet,
        });
      });
    });

    it("[valid] empty", () => {
      const targetRule = {
        action: { type: "block" },
        condition: { resourceTypes: [] },
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: ruleSet,
      });
    });

    it("[valid] multiple", () => {
      const targetRule = {
        action: { type: "block" },
        condition: { resourceTypes: ["main_frame", "media"] },
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: ruleSet,
      });
    });

    it("[valid] all", () => {
      const targetRule = {
        action: { type: "block" },
        condition: { resourceTypes },
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: ruleSet,
      });
    });

    it("[invalid] not array", () => {
      const targetRule = {
        action: { type: "block" },
        condition: { resourceTypes: "string" },
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleSetField: "rules",
            ruleNumber: 0,
            ruleField: "condition.resourceTypes",
            message: "must be array",
          },
        ],
      });
    });

    it("[invalid] invalid method", () => {
      const targetRule = {
        action: { type: "block" },
        condition: { resourceTypes: ["invalid"] },
      };
      const ruleSet = ruleToRuleSet(targetRule);
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleSetField: "rules",
            ruleNumber: 0,
            ruleField: "condition.resourceTypes",
            message: "must be equal to one of the allowed values",
          },
        ],
      });
    });
  });

  describe("A ruleNumber is specified in the Rule error", () => {
    it("[invalid] not array", () => {
      const ruleSet = {
        name: "rule set",
        rules: [
          // valid
          {
            action: { type: "block" },
            condition: { requestMethods: ["post"] },
          },
          // invalid
          {
            action: { type: "block" },
            condition: { resourceTypes: "invalid" },
          },
          // invalid
          {
            action: { type: "invalid" },
            condition: { requestMethods: ["post"] },
          },
        ],
      };
      const result = validateRuleSet(ruleSet);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleSetField: "rules",
            ruleNumber: 1,
            ruleField: "condition.resourceTypes",
            message: "must be array",
          },
          {
            ruleSetField: "rules",
            ruleNumber: 2,
            ruleField: "action.type",
            message: "must be either 'block' or 'allow'",
          },
        ],
      });
    });
  });
});
