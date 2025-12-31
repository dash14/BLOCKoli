import { describe, expect, it } from "vitest";
import {
  RequestMethod,
  ResourceType,
  RuleActionType,
} from "@/modules/core/rules";
import type {
  ChromeActionApi,
  ChromeDeclarativeNetRequestApi,
  ChromeI18nApi,
  ChromeRuntimeApi,
  ChromeStorageApi,
  IsRegexSupportedResult,
  MatchedRule,
  MatchedRuleInfo,
  RegexOptions,
  Rule,
  RuleCondition,
  TabIconDetails,
  UnsupportedRegexReason,
  UpdateRuleOptions,
} from "./api";

describe("api types", () => {
  describe("ChromeRuntimeApi", () => {
    it("interface has correct structure", () => {
      const api: ChromeRuntimeApi = {
        getId: () => "test-id",
        getURL: (path: string) => `chrome-extension://test/${path}`,
      };

      expect(api.getId()).toBe("test-id");
      expect(api.getURL("popup.html")).toBe(
        "chrome-extension://test/popup.html"
      );
    });
  });

  describe("TabIconDetails", () => {
    it("can have string path", () => {
      const details: TabIconDetails = {
        path: "icons/icon16.png",
      };

      expect(details.path).toBe("icons/icon16.png");
    });

    it("can have dictionary path", () => {
      const details: TabIconDetails = {
        path: {
          "16": "icons/icon16.png",
          "32": "icons/icon32.png",
        },
      };

      expect(details.path).toEqual({
        "16": "icons/icon16.png",
        "32": "icons/icon32.png",
      });
    });

    it("can have undefined path", () => {
      const details: TabIconDetails = {};

      expect(details.path).toBeUndefined();
    });
  });

  describe("ChromeActionApi", () => {
    it("interface has correct structure", () => {
      const setIconCalled: TabIconDetails[] = [];
      const api: ChromeActionApi = {
        setIcon: (details: TabIconDetails) => {
          setIconCalled.push(details);
        },
      };

      api.setIcon({ path: "test.png" });
      expect(setIconCalled).toHaveLength(1);
      expect(setIconCalled[0]).toEqual({ path: "test.png" });
    });
  });

  describe("ChromeStorageApi", () => {
    it("interface has correct structure", () => {
      const storage: Record<string, unknown> = {};
      const api: ChromeStorageApi = {
        get: async <T>(key: string) => storage[key] as T | undefined,
        set: async <T>(key: string, value: T) => {
          storage[key] = value;
        },
        remove: async (key: string) => {
          delete storage[key];
        },
      };

      expect(api.get).toBeDefined();
      expect(api.set).toBeDefined();
      expect(api.remove).toBeDefined();
    });
  });

  describe("ChromeI18nApi", () => {
    it("interface has correct structure", () => {
      const api: ChromeI18nApi = {
        getUILanguage: () => "en",
        getMessage: (messageName: string, _substitutions?: string | string[]) =>
          `translated:${messageName}`,
      };

      expect(api.getUILanguage()).toBe("en");
      expect(api.getMessage("hello")).toBe("translated:hello");
    });
  });

  describe("RuleCondition", () => {
    it("can have all optional fields", () => {
      const condition: RuleCondition = {};

      expect(condition.requestDomains).toBeUndefined();
      expect(condition.initiatorDomains).toBeUndefined();
      expect(condition.urlFilter).toBeUndefined();
      expect(condition.regexFilter).toBeUndefined();
      expect(condition.requestMethods).toBeUndefined();
      expect(condition.resourceTypes).toBeUndefined();
    });

    it("can have all fields populated", () => {
      const condition: RuleCondition = {
        requestDomains: ["example.com"],
        initiatorDomains: ["mysite.com"],
        urlFilter: "*://example.com/*",
        regexFilter: ".*\\.js$",
        requestMethods: [RequestMethod.GET, RequestMethod.POST],
        resourceTypes: [ResourceType.SCRIPT, ResourceType.STYLESHEET],
      };

      expect(condition.requestDomains).toEqual(["example.com"]);
      expect(condition.requestMethods).toEqual([
        RequestMethod.GET,
        RequestMethod.POST,
      ]);
    });
  });

  describe("Rule", () => {
    it("has required fields", () => {
      const rule: Rule = {
        id: 1,
        action: { type: RuleActionType.BLOCK },
        condition: {},
      };

      expect(rule.id).toBe(1);
      expect(rule.action).toEqual({ type: RuleActionType.BLOCK });
      expect(rule.condition).toEqual({});
    });

    it("can have optional priority", () => {
      const rule: Rule = {
        id: 1,
        action: { type: RuleActionType.BLOCK },
        condition: {},
        priority: 10,
      };

      expect(rule.priority).toBe(10);
    });
  });

  describe("UpdateRuleOptions", () => {
    it("can have addRules", () => {
      const options: UpdateRuleOptions = {
        addRules: [
          {
            id: 1,
            action: { type: RuleActionType.BLOCK },
            condition: {},
          },
        ],
      };

      expect(options.addRules).toHaveLength(1);
    });

    it("can have removeRuleIds", () => {
      const options: UpdateRuleOptions = {
        removeRuleIds: [1, 2, 3],
      };

      expect(options.removeRuleIds).toEqual([1, 2, 3]);
    });

    it("can have both addRules and removeRuleIds", () => {
      const options: UpdateRuleOptions = {
        addRules: [
          { id: 4, action: { type: RuleActionType.BLOCK }, condition: {} },
        ],
        removeRuleIds: [1, 2, 3],
      };

      expect(options.addRules).toHaveLength(1);
      expect(options.removeRuleIds).toEqual([1, 2, 3]);
    });
  });

  describe("MatchedRule and MatchedRuleInfo", () => {
    it("MatchedRule has ruleId", () => {
      const rule: MatchedRule = { ruleId: 42 };

      expect(rule.ruleId).toBe(42);
    });

    it("MatchedRuleInfo has rule, tabId, and timeStamp", () => {
      const info: MatchedRuleInfo = {
        rule: { ruleId: 42 },
        tabId: 123,
        timeStamp: 1234567890,
      };

      expect(info.rule.ruleId).toBe(42);
      expect(info.tabId).toBe(123);
      expect(info.timeStamp).toBe(1234567890);
    });
  });

  describe("RegexOptions", () => {
    it("has required regex field", () => {
      const options: RegexOptions = {
        regex: ".*\\.js$",
      };

      expect(options.regex).toBe(".*\\.js$");
    });

    it("can have optional isCaseSensitive", () => {
      const options: RegexOptions = {
        regex: "test",
        isCaseSensitive: true,
      };

      expect(options.isCaseSensitive).toBe(true);
    });
  });

  describe("IsRegexSupportedResult", () => {
    it("can be supported", () => {
      const result: IsRegexSupportedResult = {
        isSupported: true,
      };

      expect(result.isSupported).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it("can be unsupported with reason", () => {
      const result: IsRegexSupportedResult = {
        isSupported: false,
        reason: "syntaxError" as UnsupportedRegexReason,
      };

      expect(result.isSupported).toBe(false);
      expect(result.reason).toBe("syntaxError");
    });
  });

  describe("ChromeDeclarativeNetRequestApi", () => {
    it("interface has correct structure", () => {
      const api: ChromeDeclarativeNetRequestApi = {
        updateDynamicRules: async (_options: UpdateRuleOptions) => {},
        getDynamicRules: async () => [],
        removeAllDynamicRules: async () => {},
        getMatchedRulesInActiveTab: async () => [],
        isRegexSupported: async (_options: RegexOptions) => ({
          isSupported: true,
        }),
      };

      expect(api.updateDynamicRules).toBeDefined();
      expect(api.getDynamicRules).toBeDefined();
      expect(api.removeAllDynamicRules).toBeDefined();
      expect(api.getMatchedRulesInActiveTab).toBeDefined();
      expect(api.isRegexSupported).toBeDefined();
    });
  });
});
