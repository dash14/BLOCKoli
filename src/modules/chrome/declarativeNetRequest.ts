import { RuleActionType, Rules } from "@/modules/core/rules";
import {
  ChromeApiDeclarativeNetRequest,
  IsRegexSupportedResult,
  MatchedRuleInfo,
  RegexOptions,
  UpdateRuleOptions,
} from "./api";
import logging from "@/modules/utils/logging";

const log = logging.getLogger("net");

const RESERVED_RULES = [
  {
    id: 1,
    action: {
      type: RuleActionType.ALLOW,
    },
    condition: {
      initiatorDomains: [chrome.runtime.id],
    },
    priority: 100,
  },
];
export class ChromeApiDeclarativeNetRequestImpl
  implements ChromeApiDeclarativeNetRequest
{
  async updateDynamicRules(options: UpdateRuleOptions): Promise<void> {
    const ruleOptions = addReservedRules(
      options as chrome.declarativeNetRequest.UpdateRuleOptions
    );

    log.debug("updateDynamicRules:", ruleOptions);
    await chrome.declarativeNetRequest.updateDynamicRules(ruleOptions);
  }

  async getDynamicRules(): Promise<Rules> {
    const rules =
      chrome.declarativeNetRequest.getDynamicRules() as unknown as Rules;
    log.debug("getDynamicRules", rules);
    return removeReservedRules(rules);
  }

  async removeAllDynamicRules(): Promise<void> {
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    const removeRuleIds = rules.map((r) => r.id);
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds });
  }

  async getMatchedRulesInActiveTab(): Promise<MatchedRuleInfo[]> {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) {
      return [];
    }
    const tab = tabs[0];
    if (tab.url?.includes("chrome://")) {
      return [];
    }
    const rules = await chrome.declarativeNetRequest.getMatchedRules({
      tabId: tab.id,
    });
    return rules.rulesMatchedInfo;
  }

  async isRegexSupported(
    options: RegexOptions
  ): Promise<IsRegexSupportedResult> {
    return await chrome.declarativeNetRequest.isRegexSupported({
      ...options,
      requireCapturing: false,
    });
  }
}

function addReservedRules(
  options: chrome.declarativeNetRequest.UpdateRuleOptions
): chrome.declarativeNetRequest.UpdateRuleOptions {
  if (!options.addRules) {
    options.addRules = [];
  }
  if (!options.removeRuleIds) {
    options.removeRuleIds = [];
  }

  const ids = RESERVED_RULES.map((rule) => rule.id);

  return {
    addRules: [...(options.addRules ?? []), ...RESERVED_RULES],
    removeRuleIds: [...(options.removeRuleIds ?? []), ...ids],
  };
}

function removeReservedRules(rules: Rules): Rules {
  const ids = new Set(RESERVED_RULES.map((rule) => rule.id));
  return rules.filter((rule) => !ids.has(rule.id));
}
