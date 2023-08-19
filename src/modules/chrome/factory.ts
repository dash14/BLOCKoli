import { ChromeApiDeclarativeNetRequest } from "./api";

export class ChromeApiFactory {
  public declarativeNetRequest(): ChromeApiDeclarativeNetRequest {
    return {
      async updateDynamicRules(
        options: chrome.declarativeNetRequest.UpdateRuleOptions
      ) {
        return chrome.declarativeNetRequest.updateDynamicRules(options);
      },
    };
  }
}
