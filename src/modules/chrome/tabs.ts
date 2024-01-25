import { ChromeTabsApi, TabActiveInfo } from "./api";

export class ChromeTabsApiImpl implements ChromeTabsApi {
  async getActiveTabId(): Promise<number | undefined> {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) {
      return undefined;
    }
    const tab = tabs[0];
    if (tab.url?.includes("chrome://")) {
      return undefined;
    }
    return tab.id;
  }

  addActivateListener(listener: (event: TabActiveInfo) => void): void {
    chrome.tabs.onActivated.addListener(listener);
  }

  removeActivateListener(listener: (event: TabActiveInfo) => void): void {
    chrome.tabs.onActivated.removeListener(listener);
  }
}
