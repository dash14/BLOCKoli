import { ChromeApiRuntime } from "./api";

export class ChromeApiRuntimeImpl implements ChromeApiRuntime {
  getId(): string {
    return chrome.runtime.id;
  }

  getURL(path: string): string {
    return chrome.runtime.getURL(path);
  }
}
