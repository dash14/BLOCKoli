import { RegexValidator } from "../core/regex";
import { UnsupportedRegexReason } from "./api";
import { ChromeApiFactory } from "./factory";

export function createRegexValidator(): RegexValidator {
  const chrome = new ChromeApiFactory();

  if (chrome.isExtension()) {
    return async (regex: string, isCaseSensitive: boolean) =>
      chrome
        .declarativeNetRequest()
        .isRegexSupported({ regex, isCaseSensitive });
  } else {
    return async (regex: string, isCaseSensitive: boolean) => {
      try {
        new RegExp(regex, isCaseSensitive ? "" : "i");
        return { isSupported: true };
      } catch (e) {
        return {
          isSupported: false,
          reason: UnsupportedRegexReason.SYNTAX_ERROR,
        };
      }
    };
  }
}
