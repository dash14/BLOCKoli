import en from "@locales/en/messages.json";
import ja from "@locales/ja/messages.json";
import { ServiceError } from "@/modules/core/ServiceError";

type Getter = { get: (target: unknown, name: string) => string };
export type I18nMessageMap = Record<string, string>;

let language: string | null = null;

const handler: Getter = {
  get: (_: unknown, name: string) => {
    if (!language) {
      if (chrome.i18n) {
        return chrome.i18n.getMessage(name);
      } else {
        const messageKey = name as keyof typeof en;
        return en[messageKey]?.message ?? "";
      }
    }
    if (language === "ja") {
      const messageKey = name as keyof typeof ja;
      return ja[messageKey]?.message ?? "";
    } else {
      const messageKey = name as keyof typeof en;
      return en[messageKey]?.message ?? "";
    }
  },
};
const messageMap = new Proxy({}, handler) as I18nMessageMap;

export function useI18n(): I18nMessageMap {
  return messageMap;
}

export function updateI18nLanguage(lang: string | null) {
  language = lang;
}

export function getLocalizedValidationErrorText(
  text: string,
  i18n: I18nMessageMap
) {
  const key = text.replace(/[- ]/g, "_").replace(/[^\w]/g, "").toLowerCase();
  const translated = i18n[key];
  return translated ? translated : text;
}

// Fills in {name} placeholders
export function formatMessage(message: string, params: Record<string, number>) {
  return Object.entries(params).reduce(
    (text, [name, value]) => text.split(`{${name}}`).join(String(value)),
    message
  );
}

// A ServiceError in the page's language; any other error keeps its own message
export function getErrorText(error: unknown, i18n: I18nMessageMap): string {
  if (error instanceof ServiceError) {
    const message = i18n[`error_${error.code}`];
    if (message) return formatMessage(message, error.params);
  }
  return error instanceof Error ? error.message : String(error);
}
