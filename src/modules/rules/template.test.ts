import { describe, expect, it } from "vitest";
import { RuleActionType } from "@/modules/core/rules";
import { newRuleSetName, newRuleTemplate } from "./template";

describe("template", () => {
  describe("newRuleTemplate", () => {
    it("blocks, with no condition yet", () => {
      expect(newRuleTemplate).toStrictEqual({
        action: { type: RuleActionType.BLOCK },
        condition: {},
      });
    });
  });

  describe("newRuleSetName", () => {
    it("is the name new rule sets are numbered after", () => {
      expect(newRuleSetName).toBe("My Rule Set");
    });
  });
});
