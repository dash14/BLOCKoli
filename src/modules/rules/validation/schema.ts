// @ts-ignore
import * as validations from "@/schemas/validate";

export function createValidator(
  validationType: "RuleSet" | "RuleSets" | "Rule"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  return validations[validationType];
}
