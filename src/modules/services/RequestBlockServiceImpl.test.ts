import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  ChromeActionApi,
  ChromeDeclarativeNetRequestApi,
  ChromeI18nApi,
  ChromeRuntimeApi,
} from "@/modules/chrome/api";
import { RuleActionType } from "@/modules/core/rules";
import type { EventEmitter } from "@/modules/core/service";
import type { StoredRuleSets } from "@/modules/rules/stored";
import { RULE_ID_UNSAVED } from "@/modules/rules/stored";
import type * as RequestBlock from "@/modules/services/RequestBlockService";
import type { ServiceConfigurationStore } from "@/modules/store/ServiceConfigurationStore";
import { RequestBlockServiceImpl } from "./RequestBlockServiceImpl";

describe("RequestBlockServiceImpl", () => {
  // Mock dependencies
  let mockEmitter: EventEmitter<RequestBlock.Events>;
  let mockStore: ServiceConfigurationStore;
  let mockRuntime: ChromeRuntimeApi;
  let mockDeclarativeNetRequest: ChromeDeclarativeNetRequestApi;
  let mockAction: ChromeActionApi;
  let mockI18n: ChromeI18nApi;

  const createService = () => {
    return new RequestBlockServiceImpl(
      mockEmitter,
      mockStore,
      mockRuntime,
      mockDeclarativeNetRequest,
      mockAction,
      mockI18n
    );
  };

  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();

    // Setup mock emitter
    mockEmitter = {
      emit: vi.fn(),
    } as unknown as EventEmitter<RequestBlock.Events>;

    // Setup mock store
    mockStore = {
      loadState: vi.fn().mockResolvedValue("disable"),
      saveState: vi.fn().mockResolvedValue(undefined),
      loadRuleSets: vi.fn().mockResolvedValue([]),
      saveRuleSets: vi.fn().mockResolvedValue(undefined),
      loadNextRuleId: vi.fn().mockResolvedValue(100),
      saveNextRuleId: vi.fn().mockResolvedValue(undefined),
      loadLanguage: vi.fn().mockResolvedValue(undefined),
      saveLanguage: vi.fn().mockResolvedValue(undefined),
    };

    // Setup mock runtime
    mockRuntime = {
      getId: vi.fn().mockReturnValue("test-extension-id"),
      getURL: vi.fn().mockReturnValue("chrome-extension://test-extension-id/"),
    } as unknown as ChromeRuntimeApi;

    // Setup mock declarativeNetRequest
    mockDeclarativeNetRequest = {
      getDynamicRules: vi.fn().mockResolvedValue([]),
      updateDynamicRules: vi.fn().mockResolvedValue(undefined),
      removeAllDynamicRules: vi.fn().mockResolvedValue(undefined),
      getMatchedRulesInActiveTab: vi.fn().mockResolvedValue([]),
    } as unknown as ChromeDeclarativeNetRequestApi;

    // Setup mock action
    mockAction = {
      setIcon: vi.fn().mockResolvedValue(undefined),
    } as unknown as ChromeActionApi;

    // Setup mock i18n
    mockI18n = {
      getUILanguage: vi.fn().mockReturnValue("en"),
    } as unknown as ChromeI18nApi;
  });

  describe("constructor", () => {
    it("creates instance with all dependencies", () => {
      const service = createService();
      expect(service).toBeInstanceOf(RequestBlockServiceImpl);
    });
  });

  describe("start", () => {
    it("activates when enabled", async () => {
      vi.mocked(mockStore.loadState).mockResolvedValue("enable");
      vi.mocked(mockStore.loadRuleSets).mockResolvedValue([]);

      const service = createService();
      await service.start();

      expect(mockStore.loadRuleSets).toHaveBeenCalled();
      expect(mockDeclarativeNetRequest.updateDynamicRules).toHaveBeenCalled();
      expect(mockAction.setIcon).toHaveBeenCalledWith({
        path: "./images/icon16.png",
      });
    });

    it("deactivates when disabled", async () => {
      vi.mocked(mockStore.loadState).mockResolvedValue("disable");

      const service = createService();
      await service.start();

      expect(mockDeclarativeNetRequest.removeAllDynamicRules).toHaveBeenCalled();
      expect(mockAction.setIcon).toHaveBeenCalledWith({
        path: "./images/icon16-gray.png",
      });
    });
  });

  describe("enable", () => {
    it("activates and emits changeState when currently disabled", async () => {
      vi.mocked(mockStore.loadState).mockResolvedValue("disable");
      vi.mocked(mockStore.loadRuleSets).mockResolvedValue([]);

      const service = createService();
      await service.enable();

      expect(mockStore.loadRuleSets).toHaveBeenCalled();
      expect(mockDeclarativeNetRequest.updateDynamicRules).toHaveBeenCalled();
      expect(mockAction.setIcon).toHaveBeenCalledWith({
        path: "./images/icon16.png",
      });
      expect(mockStore.saveState).toHaveBeenCalledWith("enable");
      expect(mockEmitter.emit).toHaveBeenCalledWith("changeState", "enable");
    });

    it("does nothing when already enabled", async () => {
      vi.mocked(mockStore.loadState).mockResolvedValue("enable");

      const service = createService();
      await service.enable();

      expect(mockStore.saveState).not.toHaveBeenCalled();
      expect(mockEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe("disable", () => {
    it("deactivates and emits changeState when currently enabled", async () => {
      vi.mocked(mockStore.loadState).mockResolvedValue("enable");

      const service = createService();
      await service.disable();

      expect(mockDeclarativeNetRequest.removeAllDynamicRules).toHaveBeenCalled();
      expect(mockAction.setIcon).toHaveBeenCalledWith({
        path: "./images/icon16-gray.png",
      });
      expect(mockStore.saveState).toHaveBeenCalledWith("disable");
      expect(mockEmitter.emit).toHaveBeenCalledWith("changeState", "disable");
    });

    it("does nothing when already disabled", async () => {
      vi.mocked(mockStore.loadState).mockResolvedValue("disable");

      const service = createService();
      await service.disable();

      expect(mockStore.saveState).not.toHaveBeenCalled();
      expect(mockEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe("isEnabled", () => {
    it("returns true when state is enable", async () => {
      vi.mocked(mockStore.loadState).mockResolvedValue("enable");

      const service = createService();
      const result = await service.isEnabled();

      expect(result).toBe(true);
    });

    it("returns false when state is disable", async () => {
      vi.mocked(mockStore.loadState).mockResolvedValue("disable");

      const service = createService();
      const result = await service.isEnabled();

      expect(result).toBe(false);
    });
  });

  describe("getRuleSets", () => {
    it("returns rule sets from store", async () => {
      const ruleSets: StoredRuleSets = [
        {
          name: "Test Set",
          rules: [
            { id: 1, action: { type: RuleActionType.BLOCK }, condition: {} },
          ],
        },
      ];
      vi.mocked(mockStore.loadRuleSets).mockResolvedValue(ruleSets);

      const service = createService();
      const result = await service.getRuleSets();

      expect(result).toEqual(ruleSets);
    });
  });

  describe("updateRuleSets", () => {
    it("does nothing when rule sets are unchanged", async () => {
      const ruleSets: StoredRuleSets = [
        {
          name: "Test Set",
          rules: [
            { id: 1, action: { type: RuleActionType.BLOCK }, condition: {} },
          ],
        },
      ];
      vi.mocked(mockStore.loadRuleSets).mockResolvedValue(ruleSets);

      const service = createService();
      const result = await service.updateRuleSets(ruleSets);

      expect(result).toEqual(ruleSets);
      expect(mockStore.saveRuleSets).not.toHaveBeenCalled();
      expect(mockEmitter.emit).not.toHaveBeenCalled();
    });

    it("assigns IDs to unsaved rules", async () => {
      vi.mocked(mockStore.loadRuleSets).mockResolvedValue([]);
      vi.mocked(mockStore.loadNextRuleId).mockResolvedValue(100);
      vi.mocked(mockStore.loadState).mockResolvedValue("disable");

      const ruleSets: StoredRuleSets = [
        {
          name: "Test Set",
          rules: [
            {
              id: RULE_ID_UNSAVED,
              action: { type: RuleActionType.BLOCK },
              condition: {},
            },
          ],
        },
      ];

      const service = createService();
      const result = await service.updateRuleSets(ruleSets);

      expect(result[0]?.rules[0]?.id).toBe(100);
      expect(mockStore.saveNextRuleId).toHaveBeenCalledWith(101);
    });

    it("applies rules when enabled", async () => {
      vi.mocked(mockStore.loadRuleSets).mockResolvedValue([]);
      vi.mocked(mockStore.loadState).mockResolvedValue("enable");

      const ruleSets: StoredRuleSets = [
        {
          name: "Test Set",
          rules: [
            { id: 1, action: { type: RuleActionType.BLOCK }, condition: {} },
          ],
        },
      ];

      const service = createService();
      await service.updateRuleSets(ruleSets);

      expect(mockDeclarativeNetRequest.updateDynamicRules).toHaveBeenCalled();
    });

    it("does not apply rules when disabled", async () => {
      vi.mocked(mockStore.loadRuleSets).mockResolvedValue([]);
      vi.mocked(mockStore.loadState).mockResolvedValue("disable");

      const ruleSets: StoredRuleSets = [
        {
          name: "Test Set",
          rules: [
            { id: 1, action: { type: RuleActionType.BLOCK }, condition: {} },
          ],
        },
      ];

      const service = createService();
      await service.updateRuleSets(ruleSets);

      expect(mockDeclarativeNetRequest.updateDynamicRules).not.toHaveBeenCalled();
    });

    it("saves to store and emits event", async () => {
      vi.mocked(mockStore.loadRuleSets).mockResolvedValue([]);
      vi.mocked(mockStore.loadState).mockResolvedValue("disable");

      const ruleSets: StoredRuleSets = [
        {
          name: "Test Set",
          rules: [
            { id: 1, action: { type: RuleActionType.BLOCK }, condition: {} },
          ],
        },
      ];

      const service = createService();
      await service.updateRuleSets(ruleSets);

      expect(mockStore.saveRuleSets).toHaveBeenCalledWith(ruleSets);
      expect(mockEmitter.emit).toHaveBeenCalledWith("updateRuleSets", ruleSets);
    });
  });

  describe("getMatchedRules", () => {
    it("returns empty array when no matched rules", async () => {
      vi.mocked(
        mockDeclarativeNetRequest.getMatchedRulesInActiveTab
      ).mockResolvedValue([]);

      const service = createService();
      const result = await service.getMatchedRules();

      expect(result).toEqual([]);
    });

    it("filters out reserved rules and returns matched rules", async () => {
      const ruleSets: StoredRuleSets = [
        {
          name: "Test Set",
          rules: [
            { id: 50, action: { type: RuleActionType.BLOCK }, condition: {} },
          ],
        },
      ];
      vi.mocked(mockStore.loadRuleSets).mockResolvedValue(ruleSets);
      vi.mocked(
        mockDeclarativeNetRequest.getMatchedRulesInActiveTab
      ).mockResolvedValue([
        { rule: { ruleId: 50 }, timeStamp: 1234567890, tabId: 1 },
      ]);

      const service = createService();
      const result = await service.getMatchedRules();

      expect(result).toHaveLength(1);
      expect(result[0].ruleId).toBe(50);
      expect(result[0].rule.ruleSetName).toBe("Test Set");
      expect(result[0].rule.number).toBe(1);
      expect(result[0].rule.isBlocking).toBe(true);
    });

    it("excludes reserved rules from results", async () => {
      // Reserved rule IDs are 1-10 based on RESERVED_RULE_ID_MAX
      vi.mocked(mockStore.loadRuleSets).mockResolvedValue([]);
      vi.mocked(
        mockDeclarativeNetRequest.getMatchedRulesInActiveTab
      ).mockResolvedValue([
        { rule: { ruleId: 1 }, timeStamp: 1234567890, tabId: 1 }, // Reserved rule
      ]);

      const service = createService();
      const result = await service.getMatchedRules();

      expect(result).toEqual([]);
    });
  });

  describe("getLanguage", () => {
    it("returns stored language when available", async () => {
      vi.mocked(mockStore.loadLanguage).mockResolvedValue("ja");

      const service = createService();
      const result = await service.getLanguage();

      expect(result).toBe("ja");
    });

    it("returns default UI language when not stored", async () => {
      vi.mocked(mockStore.loadLanguage).mockResolvedValue(undefined);
      vi.mocked(mockI18n.getUILanguage).mockReturnValue("en-US");

      const service = createService();
      const result = await service.getLanguage();

      expect(result).toBe("en-US");
    });
  });

  describe("setLanguage", () => {
    it("saves undefined when language matches default", async () => {
      vi.mocked(mockI18n.getUILanguage).mockReturnValue("en");

      const service = createService();
      await service.setLanguage("en");

      expect(mockStore.saveLanguage).toHaveBeenCalledWith(undefined);
    });

    it("saves language when different from default", async () => {
      vi.mocked(mockI18n.getUILanguage).mockReturnValue("en");

      const service = createService();
      await service.setLanguage("ja");

      expect(mockStore.saveLanguage).toHaveBeenCalledWith("ja");
    });
  });

  describe("export", () => {
    it("exports rule sets in BLOCKoli format", async () => {
      const ruleSets: StoredRuleSets = [
        {
          name: "Test Set",
          rules: [
            { id: 1, action: { type: RuleActionType.BLOCK }, condition: {} },
          ],
        },
      ];
      vi.mocked(mockStore.loadRuleSets).mockResolvedValue(ruleSets);

      const service = createService();
      const result = await service.export();

      expect(result.format).toBe("BLOCKoli");
      expect(result.version).toBe(1);
      expect(result.ruleSets).toHaveLength(1);
      expect(result.ruleSets[0].name).toBe("Test Set");
    });
  });

  describe("import", () => {
    it("returns validation errors for invalid object", async () => {
      vi.mocked(mockStore.loadRuleSets).mockResolvedValue([]);

      const service = createService();
      const [valid, errors] = await service.import({ invalid: "data" });

      expect(valid).toBe(false);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("updates rule sets when import is valid", async () => {
      // First call in import(), second call in updateRuleSets->getRuleSets
      vi.mocked(mockStore.loadRuleSets)
        .mockResolvedValueOnce([]) // for import() to get existing rules
        .mockResolvedValueOnce([]); // for updateRuleSets() comparison
      vi.mocked(mockStore.loadState).mockResolvedValue("disable");
      vi.mocked(mockStore.loadNextRuleId).mockResolvedValue(100);

      const importData = {
        format: "BLOCKoli",
        version: 1,
        ruleSets: [
          {
            name: "Imported Set",
            rules: [
              {
                action: { type: RuleActionType.BLOCK },
                condition: { requestDomains: ["example.com"] },
              },
            ],
          },
        ],
      };

      const service = createService();
      const [valid, errors] = await service.import(importData);

      expect(errors).toEqual([]);
      expect(valid).toBe(true);
      expect(mockStore.saveRuleSets).toHaveBeenCalled();
    });
  });
});
