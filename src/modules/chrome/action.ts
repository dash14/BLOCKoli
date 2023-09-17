import { ChromeActionApi, TabIconDetails } from "./api";

export class ChromeActionApiImpl implements ChromeActionApi {
  setIcon(details: TabIconDetails): void {
    chrome.action.setIcon(details);
  }
}
