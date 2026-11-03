import { describe, expect, it } from "vitest";
import { RuleActionType } from "@/modules/core/rules";
import { countRules } from "./limits";

describe("countRules", () => {
  const rule = { id: 11, action: { type: RuleActionType.BLOCK }, condition: {} };

  it("counts the rules of every rule set", () => {
    expect(countRules([{ rules: [rule, rule] }, { rules: [] }, { rules: [rule] }])).toBe(3);
  });

  it("counts no rule sets as zero", () => {
    expect(countRules([])).toBe(0);
  });
});
