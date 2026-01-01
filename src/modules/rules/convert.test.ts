import { describe, expect, it } from "vitest";
import { RuleActionType, RequestMethod, ResourceType, RESOURCE_TYPES } from "@/modules/core/rules";
import { convertToApiRule } from "./convert";
import type { StoredRule } from "./stored";

describe("convert", () => {
  describe("convertToApiRule", () => {
    it("converts empty array to empty array", () => {
      const result = convertToApiRule([]);
      expect(result).toEqual([]);
    });

    it("converts basic rule with id and action", () => {
      const storedRules: StoredRule[] = [
        {
          id: 1,
          action: { type: RuleActionType.BLOCK },
          condition: {},
        },
      ];

      const result = convertToApiRule(storedRules);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].action.type).toBe("block");
    });

    it("sets all RESOURCE_TYPES when resourceTypes is empty", () => {
      const storedRules: StoredRule[] = [
        {
          id: 1,
          action: { type: RuleActionType.BLOCK },
          condition: {},
        },
      ];

      const result = convertToApiRule(storedRules);

      expect(result[0].condition.resourceTypes).toEqual(RESOURCE_TYPES);
    });

    it("preserves resourceTypes when specified", () => {
      const storedRules: StoredRule[] = [
        {
          id: 1,
          action: { type: RuleActionType.BLOCK },
          condition: {
            resourceTypes: [ResourceType.SCRIPT, ResourceType.STYLESHEET],
          },
        },
      ];

      const result = convertToApiRule(storedRules);

      expect(result[0].condition.resourceTypes).toEqual([
        ResourceType.SCRIPT,
        ResourceType.STYLESHEET,
      ]);
    });

    it("converts requestDomains when specified", () => {
      const storedRules: StoredRule[] = [
        {
          id: 1,
          action: { type: RuleActionType.BLOCK },
          condition: {
            requestDomains: ["example.com", "test.com"],
          },
        },
      ];

      const result = convertToApiRule(storedRules);

      expect(result[0].condition.requestDomains).toEqual([
        "example.com",
        "test.com",
      ]);
    });

    it("omits requestDomains when empty array", () => {
      const storedRules: StoredRule[] = [
        {
          id: 1,
          action: { type: RuleActionType.BLOCK },
          condition: {
            requestDomains: [],
          },
        },
      ];

      const result = convertToApiRule(storedRules);

      expect(result[0].condition.requestDomains).toBeUndefined();
    });

    it("converts initiatorDomains when specified", () => {
      const storedRules: StoredRule[] = [
        {
          id: 1,
          action: { type: RuleActionType.BLOCK },
          condition: {
            initiatorDomains: ["mysite.com"],
          },
        },
      ];

      const result = convertToApiRule(storedRules);

      expect(result[0].condition.initiatorDomains).toEqual(["mysite.com"]);
    });

    it("omits initiatorDomains when empty array", () => {
      const storedRules: StoredRule[] = [
        {
          id: 1,
          action: { type: RuleActionType.BLOCK },
          condition: {
            initiatorDomains: [],
          },
        },
      ];

      const result = convertToApiRule(storedRules);

      expect(result[0].condition.initiatorDomains).toBeUndefined();
    });

    it("converts requestMethods when specified", () => {
      const storedRules: StoredRule[] = [
        {
          id: 1,
          action: { type: RuleActionType.BLOCK },
          condition: {
            requestMethods: [RequestMethod.GET, RequestMethod.POST],
          },
        },
      ];

      const result = convertToApiRule(storedRules);

      expect(result[0].condition.requestMethods).toEqual(["get", "post"]);
    });

    it("omits requestMethods when empty array", () => {
      const storedRules: StoredRule[] = [
        {
          id: 1,
          action: { type: RuleActionType.BLOCK },
          condition: {
            requestMethods: [],
          },
        },
      ];

      const result = convertToApiRule(storedRules);

      expect(result[0].condition.requestMethods).toBeUndefined();
    });

    it("sets urlFilter when isRegexFilter is false", () => {
      const storedRules: StoredRule[] = [
        {
          id: 1,
          action: { type: RuleActionType.BLOCK },
          condition: {
            urlFilter: "*://example.com/*",
            isRegexFilter: false,
          },
        },
      ];

      const result = convertToApiRule(storedRules);

      expect(result[0].condition.urlFilter).toBe("*://example.com/*");
      expect(result[0].condition.regexFilter).toBeUndefined();
    });

    it("sets regexFilter when isRegexFilter is true", () => {
      const storedRules: StoredRule[] = [
        {
          id: 1,
          action: { type: RuleActionType.BLOCK },
          condition: {
            urlFilter: ".*\\.js$",
            isRegexFilter: true,
          },
        },
      ];

      const result = convertToApiRule(storedRules);

      expect(result[0].condition.regexFilter).toBe(".*\\.js$");
      expect(result[0].condition.urlFilter).toBeUndefined();
    });

    it("sets urlFilter when isRegexFilter is undefined", () => {
      const storedRules: StoredRule[] = [
        {
          id: 1,
          action: { type: RuleActionType.BLOCK },
          condition: {
            urlFilter: "*://example.com/*",
          },
        },
      ];

      const result = convertToApiRule(storedRules);

      expect(result[0].condition.urlFilter).toBe("*://example.com/*");
      expect(result[0].condition.regexFilter).toBeUndefined();
    });

    it("does not set urlFilter or regexFilter when urlFilter is empty", () => {
      const storedRules: StoredRule[] = [
        {
          id: 1,
          action: { type: RuleActionType.BLOCK },
          condition: {
            urlFilter: "",
          },
        },
      ];

      const result = convertToApiRule(storedRules);

      expect(result[0].condition.urlFilter).toBeUndefined();
      expect(result[0].condition.regexFilter).toBeUndefined();
    });

    it("converts multiple rules", () => {
      const storedRules: StoredRule[] = [
        {
          id: 1,
          action: { type: RuleActionType.BLOCK },
          condition: { requestDomains: ["ads.com"] },
        },
        {
          id: 2,
          action: { type: RuleActionType.ALLOW },
          condition: { requestDomains: ["safe.com"] },
        },
      ];

      const result = convertToApiRule(storedRules);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[0].action.type).toBe("block");
      expect(result[1].id).toBe(2);
      expect(result[1].action.type).toBe("allow");
    });

    it("converts rule with all condition fields", () => {
      const storedRules: StoredRule[] = [
        {
          id: 42,
          action: { type: RuleActionType.BLOCK },
          condition: {
            requestDomains: ["example.com"],
            initiatorDomains: ["mysite.com"],
            urlFilter: "tracking",
            isRegexFilter: false,
            requestMethods: [RequestMethod.GET],
            resourceTypes: [ResourceType.SCRIPT],
          },
        },
      ];

      const result = convertToApiRule(storedRules);

      expect(result[0].id).toBe(42);
      expect(result[0].condition.requestDomains).toEqual(["example.com"]);
      expect(result[0].condition.initiatorDomains).toEqual(["mysite.com"]);
      expect(result[0].condition.urlFilter).toBe("tracking");
      expect(result[0].condition.requestMethods).toEqual(["get"]);
      expect(result[0].condition.resourceTypes).toEqual(["script"]);
    });
  });
});
