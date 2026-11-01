import { RegexValidator } from "@/modules/core/regex";
import { Rule } from "@/modules/core/rules";
import {
  RuleValidationError,
  RuleValidationResult,
  validateRule,
} from "./Rule";

export class RuleValidator {
  private regexValidator: RegexValidator;
  constructor(regexValidator: RegexValidator) {
    this.regexValidator = regexValidator;
  }

  public async validate(rule: Rule): Promise<RuleValidationResult> {
    const result = validateRule(rule);
    if (result.valid) {
      const error = await validateRegexSupport(rule, this.regexValidator);
      if (error) {
        return { valid: false, errors: [error] };
      }
    }
    return result;
  }
}

// One regex that RE2 rejects makes updateDynamicRules fail for every rule
export async function validateRegexSupport(
  rule: Rule,
  regexValidator: RegexValidator
): Promise<RuleValidationError | undefined> {
  const { isRegexFilter, urlFilter } = rule.condition;
  if (!isRegexFilter || !urlFilter) return undefined;

  // Rules are applied without isUrlFilterCaseSensitive, which defaults to false
  const result = await regexValidator(urlFilter, false);
  if (result.isSupported) return undefined;

  return {
    ruleField: "condition.urlFilter",
    message: result.reason ?? "Not supported regex",
  };
}
