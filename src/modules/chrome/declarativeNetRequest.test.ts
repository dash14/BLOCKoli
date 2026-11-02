import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { RuleActionType } from "@/modules/core/rules";
import { ChromeDeclarativeNetRequestApiImpl } from "./declarativeNetRequest";
import type { Rule } from "./api";

// Mock logging
const log = vi.hoisted(() => ({ debug: vi.fn(), warn: vi.fn() }));
vi.mock("@/modules/utils/logging", () => ({
  default: {
    getLogger: () => log,
  },
}));

describe("ChromeDeclarativeNetRequestApiImpl", () => {
  let mockUpdateDynamicRules: ReturnType<typeof vi.fn>;
  let mockGetDynamicRules: ReturnType<typeof vi.fn>;
  let mockGetMatchedRules: ReturnType<typeof vi.fn>;
  let mockIsRegexSupported: ReturnType<typeof vi.fn>;
  let mockTabsQuery: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    log.warn.mockClear();
    mockUpdateDynamicRules = vi.fn().mockResolvedValue(undefined);
    mockGetDynamicRules = vi.fn().mockResolvedValue([]);
    mockGetMatchedRules = vi.fn().mockResolvedValue({ rulesMatchedInfo: [] });
    mockIsRegexSupported = vi.fn().mockResolvedValue({ isSupported: true });
    mockTabsQuery = vi
      .fn()
      .mockResolvedValue([{ id: 1, url: "https://example.com" }]);

    vi.stubGlobal("chrome", {
      declarativeNetRequest: {
        updateDynamicRules: mockUpdateDynamicRules,
        getDynamicRules: mockGetDynamicRules,
        getMatchedRules: mockGetMatchedRules,
        isRegexSupported: mockIsRegexSupported,
        MAX_NUMBER_OF_DYNAMIC_RULES: 30000,
        MAX_NUMBER_OF_REGEX_RULES: 1000,
      },
      tabs: {
        query: mockTabsQuery,
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("updateDynamicRules", () => {
    it("calls chrome.declarativeNetRequest.updateDynamicRules with options", async () => {
      const api = new ChromeDeclarativeNetRequestApiImpl();
      const options = {
        addRules: [
          { id: 1, action: { type: RuleActionType.BLOCK }, condition: {} },
        ],
      };

      await api.updateDynamicRules(options);

      expect(mockUpdateDynamicRules).toHaveBeenCalledWith(options);
    });

    it("calls with removeRuleIds", async () => {
      const api = new ChromeDeclarativeNetRequestApiImpl();
      const options = {
        removeRuleIds: [1, 2, 3],
      };

      await api.updateDynamicRules(options);

      expect(mockUpdateDynamicRules).toHaveBeenCalledWith(options);
    });
  });

  describe("getDynamicRules", () => {
    it("returns rules from chrome.declarativeNetRequest.getDynamicRules", async () => {
      const rules: Rule[] = [
        { id: 1, action: { type: RuleActionType.BLOCK }, condition: {} },
        {
          id: 2,
          action: { type: RuleActionType.ALLOW },
          condition: { urlFilter: "*" },
        },
      ];
      mockGetDynamicRules.mockResolvedValue(rules);

      const api = new ChromeDeclarativeNetRequestApiImpl();
      const result = await api.getDynamicRules();

      expect(result).toEqual(rules);
    });

    it("returns empty array when no rules", async () => {
      mockGetDynamicRules.mockResolvedValue([]);

      const api = new ChromeDeclarativeNetRequestApiImpl();
      const result = await api.getDynamicRules();

      expect(result).toEqual([]);
    });
  });

  describe("removeAllDynamicRules", () => {
    it("removes all existing rules", async () => {
      const existingRules = [
        { id: 1, action: { type: RuleActionType.BLOCK }, condition: {} },
        { id: 2, action: { type: RuleActionType.ALLOW }, condition: {} },
        { id: 3, action: { type: RuleActionType.BLOCK }, condition: {} },
      ];
      mockGetDynamicRules.mockResolvedValue(existingRules);

      const api = new ChromeDeclarativeNetRequestApiImpl();
      await api.removeAllDynamicRules();

      expect(mockUpdateDynamicRules).toHaveBeenCalledWith({
        removeRuleIds: [1, 2, 3],
      });
    });

    it("handles empty rules list", async () => {
      mockGetDynamicRules.mockResolvedValue([]);

      const api = new ChromeDeclarativeNetRequestApiImpl();
      await api.removeAllDynamicRules();

      expect(mockUpdateDynamicRules).toHaveBeenCalledWith({
        removeRuleIds: [],
      });
    });
  });

  describe("getMatchedRulesInActiveTab", () => {
    it("returns matched rules for active tab", async () => {
      const matchedRules = [
        { rule: { ruleId: 1 }, tabId: 1, timeStamp: 1234567890 },
        { rule: { ruleId: 2 }, tabId: 1, timeStamp: 1234567891 },
      ];
      mockGetMatchedRules.mockResolvedValue({ rulesMatchedInfo: matchedRules });

      const api = new ChromeDeclarativeNetRequestApiImpl();
      const result = await api.getMatchedRulesInActiveTab();

      expect(result).toEqual(matchedRules);
      expect(mockGetMatchedRules).toHaveBeenCalledWith({ tabId: 1 });
    });

    it("returns empty array when no active tabs", async () => {
      mockTabsQuery.mockResolvedValue([]);

      const api = new ChromeDeclarativeNetRequestApiImpl();
      const result = await api.getMatchedRulesInActiveTab();

      expect(result).toEqual([]);
      expect(mockGetMatchedRules).not.toHaveBeenCalled();
    });

    it("returns empty array for chrome:// URLs", async () => {
      mockTabsQuery.mockResolvedValue([{ id: 1, url: "chrome://settings" }]);

      const api = new ChromeDeclarativeNetRequestApiImpl();
      const result = await api.getMatchedRulesInActiveTab();

      expect(result).toEqual([]);
      expect(mockGetMatchedRules).not.toHaveBeenCalled();
    });

    it("returns cached value when rate limit exceeded", async () => {
      const matchedRules = [
        { rule: { ruleId: 1 }, tabId: 1, timeStamp: 1234567890 },
      ];
      mockGetMatchedRules.mockResolvedValueOnce({
        rulesMatchedInfo: matchedRules,
      });

      const api = new ChromeDeclarativeNetRequestApiImpl();

      // First call - populates cache
      const result1 = await api.getMatchedRulesInActiveTab();
      expect(result1).toEqual(matchedRules);

      // Second call - rate limit exceeded, returns cached value
      const error = new Error("Rate limit exceeded");
      mockGetMatchedRules.mockRejectedValueOnce(error);
      const result2 = await api.getMatchedRulesInActiveTab();
      expect(result2).toEqual(matchedRules);
      expect(log.warn).toHaveBeenCalledWith(
        "getMatchedRules failed, using the cached result",
        error
      );
    });

    it("does not return the cached value of another tab", async () => {
      const matchedRules = [
        { rule: { ruleId: 1 }, tabId: 1, timeStamp: 1234567890 },
      ];
      mockGetMatchedRules.mockResolvedValueOnce({
        rulesMatchedInfo: matchedRules,
      });
      const api = new ChromeDeclarativeNetRequestApiImpl();
      await api.getMatchedRulesInActiveTab();

      mockTabsQuery.mockResolvedValue([{ id: 2, url: "https://example.com" }]);
      mockGetMatchedRules.mockRejectedValueOnce(
        new Error("Rate limit exceeded")
      );

      expect(await api.getMatchedRulesInActiveTab()).toEqual([]);
    });

    it("does not return the cached value of the page shown before", async () => {
      mockTabsQuery.mockResolvedValue([{ id: 3, url: "https://a.example" }]);
      mockGetMatchedRules.mockResolvedValueOnce({
        rulesMatchedInfo: [
          { rule: { ruleId: 1 }, tabId: 3, timeStamp: 1234567890 },
        ],
      });
      const api = new ChromeDeclarativeNetRequestApiImpl();
      await api.getMatchedRulesInActiveTab();

      mockTabsQuery.mockResolvedValue([{ id: 3, url: "https://b.example" }]);
      mockGetMatchedRules.mockRejectedValueOnce(
        new Error("Rate limit exceeded")
      );

      expect(await api.getMatchedRulesInActiveTab()).toEqual([]);
    });

    it("returns empty array for a tab without an ID", async () => {
      mockTabsQuery.mockResolvedValue([{ url: "https://example.com" }]);

      const api = new ChromeDeclarativeNetRequestApiImpl();
      const result = await api.getMatchedRulesInActiveTab();

      expect(result).toEqual([]);
      expect(mockGetMatchedRules).not.toHaveBeenCalled();
    });

    it("handles tab without url property", async () => {
      mockTabsQuery.mockResolvedValue([{ id: 1 }]);

      const api = new ChromeDeclarativeNetRequestApiImpl();
      const result = await api.getMatchedRulesInActiveTab();

      expect(mockGetMatchedRules).toHaveBeenCalledWith({ tabId: 1 });
      expect(result).toEqual([]);
    });
  });

  describe("getRuleLimits", () => {
    it("returns the limits Chrome defines for dynamic rules", () => {
      const api = new ChromeDeclarativeNetRequestApiImpl();

      expect(api.getRuleLimits()).toEqual({
        maxDynamicRules: 30000,
        maxRegexRules: 1000,
      });
    });
  });

  describe("isRegexSupported", () => {
    it("returns supported result for valid regex", async () => {
      mockIsRegexSupported.mockResolvedValue({ isSupported: true });

      const api = new ChromeDeclarativeNetRequestApiImpl();
      const result = await api.isRegexSupported({
        regex: ".*\\.js$",
        isCaseSensitive: true,
      });

      expect(result).toEqual({ isSupported: true });
      expect(mockIsRegexSupported).toHaveBeenCalledWith({
        regex: ".*\\.js$",
        isCaseSensitive: true,
        requireCapturing: false,
      });
    });

    it("returns unsupported result for invalid regex", async () => {
      mockIsRegexSupported.mockResolvedValue({
        isSupported: false,
        reason: "syntaxError",
      });

      const api = new ChromeDeclarativeNetRequestApiImpl();
      const result = await api.isRegexSupported({
        regex: "[invalid",
      });

      expect(result).toEqual({ isSupported: false, reason: "syntaxError" });
    });

    it("adds requireCapturing: false to options", async () => {
      const api = new ChromeDeclarativeNetRequestApiImpl();
      await api.isRegexSupported({ regex: "test" });

      expect(mockIsRegexSupported).toHaveBeenCalledWith({
        regex: "test",
        requireCapturing: false,
      });
    });
  });
});
