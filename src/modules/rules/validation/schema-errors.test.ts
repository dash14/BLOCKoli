import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SchemaValidator } from "@/schemas/validate.mjs";
import { validateRule } from "./Rule";
import { validateRuleSet } from "./RuleSet";

// Stands in for the generated validators, to return errors ajv itself never
// produces for our schema.
const validate = vi.fn() as unknown as SchemaValidator & ReturnType<typeof vi.fn>;
vi.mock("./schema", () => ({ createValidator: () => validate }));

const rule = { action: { type: "block" }, condition: { urlFilter: "x" } };

describe("schema validator results", () => {
  beforeEach(() => {
    validate.mockReset();
    validate.mockReturnValue(false);
    validate.errors = undefined;
  });

  it("treats a failed rule validation without errors as invalid", () => {
    expect(validateRule(rule)).toEqual({ valid: false, errors: [] });
  });

  it("treats a failed rule set validation without errors as invalid", () => {
    expect(validateRuleSet({ name: "set", rules: [rule] })).toEqual({
      valid: false,
      errors: [],
    });
  });

  it("reports a non-numeric index under the rule set field only", () => {
    validate.errors = [{ instancePath: "/rules/first", message: "bad" }];

    expect(validateRuleSet({ name: "set", rules: [rule] })).toEqual({
      valid: false,
      errors: [{ ruleSetField: "rules", message: "bad" }],
    });
  });

  it("sorts a rule set error reported after a rule error by rule number", () => {
    validate.errors = [
      { instancePath: "/rules/1/action", message: "rule" },
      { instancePath: "", message: "rule set" },
    ];

    expect(validateRuleSet({ name: "set", rules: [rule, rule] })).toEqual({
      valid: false,
      errors: [
        { message: "rule set" },
        {
          ruleSetField: "rules",
          ruleNumber: 1,
          ruleField: "action",
          message: "rule",
        },
      ],
    });
  });
});
