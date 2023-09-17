import { ChromeRuntimeApi } from "./api";

export class ChromeRuntimeApiImpl implements ChromeRuntimeApi {
  getId(): string {
    return chrome.runtime.id;
  }

  getURL(path: string): string {
    return chrome.runtime.getURL(path);
  }
}
