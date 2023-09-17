import { RegexValidator } from "@/modules/core/regex";
import { Rule } from "@/modules/core/rules";

export type RuleValidationResult =
  | {
      isValid: true;
    }
  | {
      isValid: false;
      reason: {
        isInvalidUrlFilter: false;
      };
    }
  | {
      isValid: false;
      reason: {
        isInvalidUrlFilter: true;
        urlFilterReason: string;
      };
    };

export class RuleValidator {
  private regexValidator: RegexValidator;
  constructor(regexValidator: RegexValidator) {
    this.regexValidator = regexValidator;
  }

  public async validate(rule: Rule): Promise<RuleValidationResult> {
    if (rule.condition.isRegexFilter && rule.condition.urlFilter) {
      const result = await this.regexValidator(rule.condition.urlFilter, false);
      if (!result.isSupported) {
        return {
          isValid: false,
          reason: {
            isInvalidUrlFilter: true,
            urlFilterReason: result.reason ?? "Not supported regex",
          },
        };
      }
    }

    if (
      !!rule.condition.requestMethods?.length ||
      !!rule.condition.initiatorDomains?.length ||
      !!rule.condition.urlFilter ||
      !!rule.condition.resourceTypes?.length
    ) {
      return {
        isValid: true,
      };
    } else {
      return {
        isValid: false,
        reason: {
          isInvalidUrlFilter: false,
        },
      };
    }
  }
}
