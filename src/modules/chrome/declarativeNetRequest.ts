import { Rules } from "@/modules/core/rules";
import { ChromeApiDeclarativeNetRequest, UpdateRuleOptions } from "./api";

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
}
