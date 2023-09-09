import { Rules } from "@/modules/core/rules";
import {
  ChromeApiDeclarativeNetRequest,
  IsRegexSupportedResult,
  MatchedRuleInfo,
  RegexOptions,
  UpdateRuleOptions,
} from "./api";

export class ChromeApiDeclarativeNetRequestImpl
  implements ChromeApiDeclarativeNetRequest
{
  async updateDynamicRules(options: UpdateRuleOptions): Promise<void> {
    console.log("updateDynamicRules:", options);
    await chrome.declarativeNetRequest.updateDynamicRules(
      options as chrome.declarativeNetRequest.UpdateRuleOptions
    );
  }

  async getDynamicRules(): Promise<Rules> {
    return chrome.declarativeNetRequest.getDynamicRules() as unknown as Rules;
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
