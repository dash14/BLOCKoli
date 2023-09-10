import { MessageProxyFactory } from "@/modules/chrome/message/MessageProxy";
import * as RequestBlock from "@/modules/services/RequestBlockService";
import { MessageProxy } from "@/modules/chrome/message/types";
import logging from "@/modules/utils/logging";
import { Rule, RuleSets, newRuleTemplate } from "../core/rules";
import { ValidationResult } from "../core/validation";
import { IsRegexSupportedResult } from "../chrome/api";
import cloneDeep from "lodash-es/cloneDeep";
const log = logging.getLogger("options");

export type RegexValidator = (
  regex: string,
  isCaseSensitive: boolean
) => Promise<IsRegexSupportedResult>;

export class OptionController {
  private requestBlockService: MessageProxy<RequestBlock.Service>;
  private regexValidator: RegexValidator;

  constructor(regexValidator: RegexValidator) {
    log.debug("create");
    this.requestBlockService =
      new MessageProxyFactory().create<RequestBlock.Service>(
        RequestBlock.ServiceId
      );
    this.regexValidator = regexValidator;
  }

  async getRuleSets(): Promise<RuleSets> {
    return [
      {
        name: "My RuleSet 1",
        rules: [{ ...cloneDeep(newRuleTemplate), id: 1 }],
      },
    ];
  }

  async validateRule(rule: Rule): Promise<ValidationResult> {
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
