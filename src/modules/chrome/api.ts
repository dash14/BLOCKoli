export interface ChromeApiDeclarativeNetRequest {
  updateDynamicRules(
    options: chrome.declarativeNetRequest.UpdateRuleOptions
  ): Promise<void>;
}
