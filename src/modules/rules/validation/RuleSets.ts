import { RuleSets } from "@/modules/core/rules";
import { RuleSetValidationError, validateRuleSet } from "./RuleSet";

// ------------------------------------
// Types
// ------------------------------------

interface RuleSetsValidationError extends RuleSetValidationError {
  ruleSetNumber?: number;
}

export type RuleSetsValidationResult =
  | {
      valid: true;
      evaluated: RuleSets;
    }
  | {
      valid: false;
      errors: RuleSetsValidationError[];
    };

// ------------------------------------
// Exported functions
// ------------------------------------

export function validateRuleSets(json: object): RuleSetsValidationResult {
  if (!(json instanceof Array)) {
    return { valid: false, errors: [{ message: "must be array" }] };
  }
  const ruleSets = json as object[];

  const results = ruleSets.map((ruleSet) => validateRuleSet(ruleSet));
  const valid = results.every((r) => r.valid);
  if (valid) {
    return { valid, evaluated: json as RuleSets };
  } else {
    const errors: RuleSetsValidationError[] = [];
    results.forEach((result, ruleSetNumber) => {
      if (result.valid) return;
      result.errors.forEach((error) => {
        errors.push({
          ruleSetNumber,
          ...error,
        });
      });
    });
    return { valid: false, errors };
  }
}
