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

  async getMatchedRulesInTab(tabId: number): Promise<MatchedRuleInfo[]> {
    try {
      const rules = await chrome.declarativeNetRequest.getMatchedRules({
        tabId,
      });
      return rules.rulesMatchedInfo;
    } catch (e) {
      // rate limit exceeded.
      console.log(e);
      throw e;
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

  getGetMatchedRulesQuotaInterval(): number {
    return chrome.declarativeNetRequest.GETMATCHEDRULES_QUOTA_INTERVAL;
  }

  getMaxGetMatchedRulesCallsPerInterval(): number {
    return chrome.declarativeNetRequest.MAX_GETMATCHEDRULES_CALLS_PER_INTERVAL;
  }
}
