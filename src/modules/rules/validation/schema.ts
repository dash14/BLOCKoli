import { SchemaValidator } from "@/schemas/validate.mjs";
import * as validations from "@/schemas/validate.mjs";

export function createValidator(
  validationType: "RuleSet" | "RuleSets" | "Rule"
): SchemaValidator {
  return validations[validationType];
}
