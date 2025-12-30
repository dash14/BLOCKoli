import { describe, expect, it } from "vitest";
import { newRuleTemplate, newRuleSetTemplate } from "./template";
import { RuleActionType } from "@/modules/core/rules";
import { RULE_ID_EDITING } from "./stored";

describe("template", () => {
  describe("newRuleTemplate", () => {
    it("has RULE_ID_EDITING as id", () => {
      expect(newRuleTemplate.id).toBe(RULE_ID_EDITING);
      expect(newRuleTemplate.id).toBe(-1);
    });

    it("has BLOCK action type", () => {
      expect(newRuleTemplate.action.type).toBe(RuleActionType.BLOCK);
    });

    it("has empty condition", () => {
      expect(newRuleTemplate.condition).toEqual({});
    });

    it("is a StoredRule", () => {
      expect(newRuleTemplate.id).toBeDefined();
      expect(newRuleTemplate.action).toBeDefined();
      expect(newRuleTemplate.condition).toBeDefined();
    });

    it("condition has no properties set", () => {
      expect(newRuleTemplate.condition.requestDomains).toBeUndefined();
      expect(newRuleTemplate.condition.initiatorDomains).toBeUndefined();
      expect(newRuleTemplate.condition.urlFilter).toBeUndefined();
      expect(newRuleTemplate.condition.isRegexFilter).toBeUndefined();
      expect(newRuleTemplate.condition.requestMethods).toBeUndefined();
      expect(newRuleTemplate.condition.resourceTypes).toBeUndefined();
    });
  });

  describe("newRuleSetTemplate", () => {
    it("has default name 'My Rule Set'", () => {
      expect(newRuleSetTemplate.name).toBe("My Rule Set");
    });

    it("has one rule", () => {
      expect(newRuleSetTemplate.rules).toHaveLength(1);
    });

    it("contains newRuleTemplate as first rule", () => {
      expect(newRuleSetTemplate.rules[0]).toBe(newRuleTemplate);
    });

    it("first rule has RULE_ID_EDITING", () => {
      expect(newRuleSetTemplate.rules[0].id).toBe(RULE_ID_EDITING);
    });

    it("first rule has BLOCK action", () => {
      expect(newRuleSetTemplate.rules[0].action.type).toBe(RuleActionType.BLOCK);
    });

    it("is a StoredRuleSet", () => {
      expect(newRuleSetTemplate.name).toBeDefined();
      expect(newRuleSetTemplate.rules).toBeDefined();
      expect(Array.isArray(newRuleSetTemplate.rules)).toBe(true);
    });
  });
});
