import type { UnsupportedRegexReason } from "@/modules/chrome/api";
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
    message:
      unsupportedRegexMessages.get(result.reason ?? "") ??
      UNSUPPORTED_REGEX_MESSAGE,
  };
}

export const UNSUPPORTED_REGEX_SYNTAX_MESSAGE =
  "must use only regular expression syntax Chrome supports (no backreferences or lookarounds)";
export const REGEX_TOO_COMPLEX_MESSAGE = "must be simple enough for Chrome to run";
export const UNSUPPORTED_REGEX_MESSAGE =
  "must be a regular expression Chrome supports";

// Chrome's reason codes, as messages the pages translate
const reasonMessages: Record<`${UnsupportedRegexReason}`, string> = {
  syntaxError: UNSUPPORTED_REGEX_SYNTAX_MESSAGE,
  memoryLimitExceeded: REGEX_TOO_COMPLEX_MESSAGE,
};
// A Map, so a code such as "toString" never reaches Object.prototype
const unsupportedRegexMessages = new Map<string, string>(
  Object.entries(reasonMessages)
);
