import { SchemaValidator } from "@/schemas/validate.mjs";
import * as validations from "@/schemas/validate.mjs";

export function createValidator(
  validationType: "RuleSet" | "Rule"
): SchemaValidator {
  return validations[validationType];
}
