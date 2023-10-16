import logging from "@/modules/utils/logging";
import {
  ChromeDeclarativeNetRequestApi,
  IsRegexSupportedResult,
  MatchedRuleInfo,
  RegexOptions,
  Rule,
  UpdateRuleOptions,
} from "./api";

const log = logging.getLogger("net");

let matchedRuleCache: MatchedRuleInfo[] = [];

export class ChromeDeclarativeNetRequestApiImpl
  implements ChromeDeclarativeNetRequestApi
{
  async updateDynamicRules(options: UpdateRuleOptions): Promise<void> {
    log.debug("updateDynamicRules:", options);
    await chrome.declarativeNetRequest.updateDynamicRules(options);
  }

  async getDynamicRules(): Promise<Rule[]> {
    const rules =
      (await chrome.declarativeNetRequest.getDynamicRules()) as unknown as Rule[];
    log.debug("getDynamicRules", rules);
    return rules;
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
    try {
      const rules = await chrome.declarativeNetRequest.getMatchedRules({
        tabId: tab.id,
      });
      matchedRuleCache = rules.rulesMatchedInfo;
      return rules.rulesMatchedInfo;
    } catch (e) {
      // rate limit exceeded. return cached value
      console.log(e);
      return matchedRuleCache;
    }
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
