import { RegexValidator } from "@/modules/core/regex";
import { Rule } from "@/modules/core/rules";
import { RuleValidationResult, validateRule } from "./Rule";

export class RuleValidator {
  private regexValidator: RegexValidator;
  constructor(regexValidator: RegexValidator) {
    this.regexValidator = regexValidator;
  }

  public async validate(rule: Rule): Promise<RuleValidationResult> {
    const result = validateRule(rule);
    if (result.valid) {
      // Ask Chrome to verify regular expressions as well.
      if (rule.condition.isRegexFilter && rule.condition.urlFilter) {
        const v = await this.regexValidator(rule.condition.urlFilter, true);
        if (!v.isSupported) {
          return {
            valid: false,
            errors: [
              {
                ruleField: "condition.urlFilter",
                message: v.reason ?? "Not supported regex",
              },
            ],
          };
        }
      }
    }
    return result;
  }
}
