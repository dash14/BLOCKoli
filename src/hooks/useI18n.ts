import defaultLocale from "@locales/en/messages.json";
type Getter = { get: (target: unknown, name: string) => string };
type I18nMessageMap = Record<string, string>;

const handler: Getter = chrome.i18n
  ? {
      // chrome extension
      get: (_: unknown, name: string) => chrome.i18n.getMessage(name),
    }
  : {
      // browser (develop)
      get: (_: unknown, name: string) => {
        const messageKey = name as keyof typeof defaultLocale;
        return defaultLocale[messageKey]?.message ?? "";
      },
    };
const messageMap = new Proxy({}, handler) as I18nMessageMap;

export function useI18n(): I18nMessageMap {
  return messageMap;
}
