import { ChromeApiAction, TabIconDetails } from "./api";

export class ChromeApiActionImpl implements ChromeApiAction {
  setIcon(details: TabIconDetails): void {
    chrome.action.setIcon(details);
  }
}
