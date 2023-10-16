import { describe, expect, it } from "vitest";
import { validateRule } from "./Rule";

describe("validateRule: Rule#condition", () => {
  describe("Rule `condition' field", () => {
    it("[invalid] not specified", () => {
      const rule = { action: { type: "block" } };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: false,
        errors: [{ message: "must have required property 'condition'" }],
      });
    });

    it("[invalid] not object", () => {
      const rule = { action: { type: "block" }, condition: [] };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleField: "condition",
            message: "must be object",
          },
        ],
      });
    });

    it("[invalid] empty", () => {
      const rule = {
        action: { type: "block" },
        condition: {},
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            message: "must contain at least one rule",
            ruleField: "condition",
          },
        ],
      });
    });

    it("[invalid] all fields are empty", () => {
      const rule = {
        action: { type: "block" },
        condition: {
          requestDomains: [],
          initiatorDomains: [],
          urlFilter: "",
          isRegexFilter: true,
          requestMethods: [],
          resourceTypes: [],
        },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            message: "must contain at least one rule",
            ruleField: "condition",
          },
        ],
      });
    });

    it("[invalid] has invalid field", () => {
      const rule = {
        action: { type: "block" },
        condition: {
          invalid: null,
        },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            message: "must NOT have additional properties",
            ruleField: "condition",
          },
        ],
      });
    });
  });

  describe("Rule `condition.requestDomains' field", () => {
    it("[valid]", () => {
      const rule = {
        action: { type: "block" },
        condition: {
          requestDomains: ["www.example1.com", "www.example2.com"],
        },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: rule,
      });
    });

    it("[valid] empty", () => {
      const rule = {
        action: { type: "block" },
        condition: { requestDomains: [], urlFilter: "test" },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: rule,
      });
    });

    it("[invalid] not array", () => {
      const rule = {
        action: { type: "block" },
        condition: { requestDomains: {} },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleField: "condition.requestDomains",
            message: "must be array",
          },
        ],
      });
    });

    it("[invalid] non-ascii code", () => {
      const rule = {
        action: { type: "block" },
        condition: {
          requestDomains: ["www.こんにちは.com"],
        },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleField: "condition.requestDomains",
            message: "must not contain non-ascii code and space",
          },
        ],
      });
    });

    it("[invalid] contain space", () => {
      const rule = {
        action: { type: "block" },
        condition: {
          requestDomains: ["www.example .com"],
        },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleField: "condition.requestDomains",
            message: "must not contain non-ascii code and space",
          },
        ],
      });
    });
  });

  describe("Rule `condition.initiatorDomains' field", () => {
    it("[valid]", () => {
      const rule = {
        action: { type: "block" },
        condition: {
          initiatorDomains: ["www.example1.com", "www.example2.com"],
        },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: rule,
      });
    });

    it("[valid] empty", () => {
      const rule = {
        action: { type: "block" },
        condition: { initiatorDomains: [], urlFilter: "test" },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: rule,
      });
    });

    it("[invalid] not array", () => {
      const rule = {
        action: { type: "block" },
        condition: { initiatorDomains: {} },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleField: "condition.initiatorDomains",
            message: "must be array",
          },
        ],
      });
    });

    it("[invalid] non-ascii code", () => {
      const rule = {
        action: { type: "block" },
        condition: {
          initiatorDomains: ["www.こんにちは.com"],
        },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleField: "condition.initiatorDomains",
            message: "must not contain non-ascii code and space",
          },
        ],
      });
    });

    it("[invalid] contain space", () => {
      const rule = {
        action: { type: "block" },
        condition: {
          initiatorDomains: ["www.example .com"],
        },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleField: "condition.initiatorDomains",
            message: "must not contain non-ascii code and space",
          },
        ],
      });
    });
  });

  describe("Rule `condition.urlFilter' field", () => {
    it("[valid] ascii code only", () => {
      const rule = {
        action: { type: "block" },
        condition: {
          urlFilter: "www.example1.com?q=test-message",
        },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: rule,
      });
    });

    it("[valid] empty", () => {
      const rule = {
        action: { type: "block" },
        condition: { urlFilter: "", requestDomains: ["example.com"] },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: rule,
      });
    });

    it("[invalid] not string", () => {
      const rule = {
        action: { type: "block" },
        condition: { urlFilter: {} },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleField: "condition.urlFilter",
            message: "must be string",
          },
        ],
      });
    });

    it("[invalid] non-ascii code", () => {
      const rule = {
        action: { type: "block" },
        condition: {
          urlFilter: "q=こんにちは",
        },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleField: "condition.urlFilter",
            message: "must not contain non-ascii code",
          },
        ],
      });
    });

    it("[invalid] invalid regex", () => {
      const rule = {
        action: { type: "block" },
        condition: {
          urlFilter: "www\\.[a-z",
          isRegexFilter: true,
        },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleField: "condition.urlFilter",
            message: "must not be an invalid regular expression",
          },
        ],
      });
    });
  });

  describe("Rule `condition.isRegexFilter' field", () => {
    [true, false].forEach((value) => {
      it(`[valid] ${value.toString()}`, () => {
        const rule = {
          action: { type: "block" },
          condition: { isRegexFilter: value, urlFilter: "test" },
        };
        const result = validateRule(rule);
        expect(result).toStrictEqual({
          valid: true,
          evaluated: rule,
        });
      });
    });

    it("[invalid] not boolean", () => {
      const rule = {
        action: { type: "block" },
        condition: { isRegexFilter: "" },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
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
        const rule = {
          action: { type: "block" },
          condition: {
            requestMethods: [method],
          },
        };
        const result = validateRule(rule);
        expect(result).toStrictEqual({
          valid: true,
          evaluated: rule,
        });
      });
    });

    it("[valid] empty", () => {
      const rule = {
        action: { type: "block" },
        condition: { requestMethods: [], urlFilter: "test" },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: rule,
      });
    });

    it("[valid] multiple", () => {
      const rule = {
        action: { type: "block" },
        condition: { requestMethods: ["get", "post"] },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: rule,
      });
    });

    it("[valid] all", () => {
      const rule = {
        action: { type: "block" },
        condition: { requestMethods },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: rule,
      });
    });

    it("[invalid] not array", () => {
      const rule = {
        action: { type: "block" },
        condition: { requestMethods: "string" },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleField: "condition.requestMethods",
            message: "must be array",
          },
        ],
      });
    });

    it("[invalid] invalid method", () => {
      const rule = {
        action: { type: "block" },
        condition: { requestMethods: ["invalid"] },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
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
        const rule = {
          action: { type: "block" },
          condition: {
            resourceTypes: [method],
          },
        };
        const result = validateRule(rule);
        expect(result).toStrictEqual({
          valid: true,
          evaluated: rule,
        });
      });
    });

    it("[valid] empty", () => {
      const rule = {
        action: { type: "block" },
        condition: { resourceTypes: [], urlFilter: "test" },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: rule,
      });
    });

    it("[valid] multiple", () => {
      const rule = {
        action: { type: "block" },
        condition: { resourceTypes: ["main_frame", "media"] },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: rule,
      });
    });

    it("[valid] all", () => {
      const rule = {
        action: { type: "block" },
        condition: { resourceTypes },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: true,
        evaluated: rule,
      });
    });

    it("[invalid] not array", () => {
      const rule = {
        action: { type: "block" },
        condition: { resourceTypes: "string" },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleField: "condition.resourceTypes",
            message: "must be array",
          },
        ],
      });
    });

    it("[invalid] invalid method", () => {
      const rule = {
        action: { type: "block" },
        condition: { resourceTypes: ["invalid"] },
      };
      const result = validateRule(rule);
      expect(result).toStrictEqual({
        valid: false,
        errors: [
          {
            ruleField: "condition.resourceTypes",
            message: "must be equal to one of the allowed values",
          },
        ],
      });
    });
  });
});
