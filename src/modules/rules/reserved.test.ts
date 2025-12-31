import { describe, expect, it } from "vitest";
import { RESERVED_RULE_ID_MAX, getReservedRules } from "./reserved";
import { RuleActionType } from "@/modules/core/rules";

describe("reserved", () => {
  describe("RESERVED_RULE_ID_MAX", () => {
    it("equals 10", () => {
      expect(RESERVED_RULE_ID_MAX).toBe(10);
    });

    it("is a number", () => {
      expect(typeof RESERVED_RULE_ID_MAX).toBe("number");
    });
  });

  describe("getReservedRules", () => {
    it("returns array of reserved rules", () => {
      const rules = getReservedRules("test-extension-id");

      expect(Array.isArray(rules)).toBe(true);
      expect(rules.length).toBeGreaterThan(0);
    });

    it("first rule has id 1", () => {
      const rules = getReservedRules("test-extension-id");

      expect(rules[0].id).toBe(1);
    });

    it("first rule is an ALLOW rule", () => {
      const rules = getReservedRules("test-extension-id");

      expect(rules[0].action.type).toBe(RuleActionType.ALLOW);
    });

    it("first rule allows requests from extension itself", () => {
      const extensionId = "my-extension-id";
      const rules = getReservedRules(extensionId);

      expect(rules[0].condition.initiatorDomains).toEqual([extensionId]);
    });

    it("first rule has priority 100", () => {
      const rules = getReservedRules("test-extension-id");

      expect(rules[0].priority).toBe(100);
    });

    it("uses provided extension id in condition", () => {
      const extensionId1 = "extension-abc";
      const extensionId2 = "extension-xyz";

      const rules1 = getReservedRules(extensionId1);
      const rules2 = getReservedRules(extensionId2);

      expect(rules1[0].condition.initiatorDomains).toEqual([extensionId1]);
      expect(rules2[0].condition.initiatorDomains).toEqual([extensionId2]);
    });

    it("returns new array on each call", () => {
      const rules1 = getReservedRules("test-id");
      const rules2 = getReservedRules("test-id");

      expect(rules1).not.toBe(rules2);
    });

    it("all rule ids are within reserved range", () => {
      const rules = getReservedRules("test-extension-id");

      rules.forEach((rule) => {
        expect(rule.id).toBeGreaterThanOrEqual(1);
        expect(rule.id).toBeLessThanOrEqual(RESERVED_RULE_ID_MAX);
      });
    });
  });
});
