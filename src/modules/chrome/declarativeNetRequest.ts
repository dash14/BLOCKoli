import logging from "@/modules/utils/logging";
import {
  ChromeDeclarativeNetRequestApi,
  IsRegexSupportedResult,
  MatchedRuleInfo,
  RegexOptions,
  Rule,
  RuleLimits,
  UpdateRuleOptions,
} from "./api";

const log = logging.getLogger("net");

// Last result per tab and page, for when getMatchedRules is over its quota
const matchedRuleCache = new Map<
  number,
  { url?: string; rules: MatchedRuleInfo[] }
>();

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
    if (tab.id === undefined || tab.url?.includes("chrome://")) {
      return [];
    }
    try {
      const rules = await chrome.declarativeNetRequest.getMatchedRules({
        tabId: tab.id,
      });
      matchedRuleCache.set(tab.id, {
        url: tab.url,
        rules: rules.rulesMatchedInfo,
      });
      return rules.rulesMatchedInfo;
    } catch (e) {
      log.warn("getMatchedRules failed, using the cached result", e);
      const cached = matchedRuleCache.get(tab.id);
      // Matches from the page the tab showed before do not apply
      return cached && cached.url === tab.url ? cached.rules : [];
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

  getRuleLimits(): RuleLimits {
    return {
      maxDynamicRules: chrome.declarativeNetRequest.MAX_NUMBER_OF_DYNAMIC_RULES,
      maxRegexRules: chrome.declarativeNetRequest.MAX_NUMBER_OF_REGEX_RULES,
    };
  }
}
