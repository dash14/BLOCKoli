import { ChromeI18nApi } from "./api";

export class ChromeI18nApiImpl implements ChromeI18nApi {
  getUILanguage(): string {
    return chrome.i18n.getUILanguage();
  }
  getMessage(
    messageName: string,
    substitutions?: string | string[] | undefined
  ): string {
    return chrome.i18n.getMessage(messageName, substitutions);
  }
}
