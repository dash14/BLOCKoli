import { ChromeApiRuntime } from "./api";

export class ChromeApiRuntimeImpl implements ChromeApiRuntime {
  getURL(path: string): string {
    return chrome.runtime.getURL(path);
  }
}
