import defaultLocale from "@locales/en/messages.json"
type Getter = { get: (target: unknown, name: string) => string }
type I18nMessageMap = Record<string, string>;

export function useI18n(): I18nMessageMap {
  let handler: Getter

  if (chrome.i18n) {
    // chrome extension
    handler = {
      get: (_: unknown, name: string) => chrome.i18n.getMessage(name)
    }
  } else {
    // browser (develop)
    handler = {
      get: (_: unknown, name: string) => {
        const messageKey = name as keyof typeof defaultLocale
        return defaultLocale[messageKey]?.message ?? ""
      }
    }
  }

  return new Proxy({}, handler) as I18nMessageMap
}
