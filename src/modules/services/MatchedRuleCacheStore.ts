import { ChromeStorageApi } from "../chrome/api";
import { MatchedRule } from "../rules/matched";

interface MatchedRuleCacheInfo {
  tabId: number;
  expired: number;
  matchedRules: MatchedRule[];
}

type MatchedRuleCaches = Record<string, MatchedRuleCacheInfo>;

const CACHE_KEY = "matchedRuleCache";
const CACHE_EXPIRE_TIME = 5 * 60; // 5 minutes.

export class MatchedRuleCacheStore {
  private store: ChromeStorageApi;

  constructor(store: ChromeStorageApi) {
    this.store = store;
  }

  public async put(tabId: number, matchedRules: MatchedRule[]): Promise<void> {
    let caches = ((await this.store.get(CACHE_KEY)) ?? {}) as MatchedRuleCaches;
    caches[`${tabId}`] = {
      tabId,
      expired: new Date().getTime() + CACHE_EXPIRE_TIME,
      matchedRules,
    };
    caches = this.clean(caches);
    console.log("caches(put):", caches);
    this.store.set(CACHE_KEY, caches);
  }

  public async get(tabId: number): Promise<MatchedRule[]> {
    let caches = ((await this.store.get(CACHE_KEY)) ?? {}) as MatchedRuleCaches;
    caches = this.clean(caches);
    console.log("caches(get):", caches);
    return caches[`${tabId}`]?.matchedRules ?? [];
  }

  private clean(caches: MatchedRuleCaches): MatchedRuleCaches {
    const now = new Date().getTime();
    return Object.fromEntries(
      Object.entries(caches).filter(([, entry]) => {
        return entry.expired >= now;
      })
    );
  }
}
