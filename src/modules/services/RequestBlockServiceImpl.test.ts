import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  ChromeActionApi,
  ChromeDeclarativeNetRequestApi,
  ChromeI18nApi,
  ChromeRuntimeApi,
} from "@/modules/chrome/api";
import type { Rule as ApiRule } from "@/modules/chrome/api";
import { RuleActionType } from "@/modules/core/rules";
import { RequestMethod, ResourceType } from "@/modules/core/rules";
import type { EventEmitter } from "@/modules/core/service";
import { getReservedRules } from "@/modules/rules/reserved";
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
      loadRuleSetsRevision: vi.fn().mockResolvedValue(7),
      saveRuleSetsRevision: vi.fn().mockResolvedValue(undefined),
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
      isRegexSupported: vi.fn().mockResolvedValue({ isSupported: true }),
      getRuleLimits: vi
        .fn()
        .mockReturnValue({ maxDynamicRules: 30000, maxRegexRules: 1000 }),
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

      expect(result).toEqual({ revision: 7, ruleSets });
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

      expect(result).toEqual({ revision: 7, ruleSets });
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

      expect(result.ruleSets[0]?.rules[0]?.id).toBe(100);
      expect(mockStore.saveNextRuleId).toHaveBeenCalledWith(101);
      // If saving the rule sets fails, an ID is skipped rather than reused
      expect(
        vi.mocked(mockStore.saveNextRuleId).mock.invocationCallOrder[0]
      ).toBeLessThan(
        vi.mocked(mockStore.saveRuleSets).mock.invocationCallOrder[0]
      );
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

    it("replaces rules when rule is modified", async () => {
      const prevRuleSets: StoredRuleSets = [
        {
          name: "Test Set",
          rules: [
            {
              id: 50,
              action: { type: RuleActionType.BLOCK },
              condition: { requestDomains: ["old.com"] },
            },
          ],
        },
      ];
      vi.mocked(mockStore.loadRuleSets).mockResolvedValue(prevRuleSets);
      vi.mocked(mockStore.loadState).mockResolvedValue("enable");
      // Return existing API rules
      vi.mocked(mockDeclarativeNetRequest.getDynamicRules).mockResolvedValue([
        {
          id: 50,
          action: { type: RuleActionType.BLOCK },
          condition: { requestDomains: ["old.com"] },
          priority: 1,
        },
      ]);

      const newRuleSets: StoredRuleSets = [
        {
          name: "Test Set",
          rules: [
            {
              id: 50,
              action: { type: RuleActionType.BLOCK },
              condition: { requestDomains: ["new.com"] }, // Changed
            },
          ],
        },
      ];

      const service = createService();
      await service.updateRuleSets(newRuleSets);

      // Should remove old rule and add new rule (replace)
      expect(mockDeclarativeNetRequest.updateDynamicRules).toHaveBeenCalledWith(
        expect.objectContaining({
          removeRuleIds: expect.arrayContaining([50]),
          addRules: expect.arrayContaining([
            expect.objectContaining({ id: 50 }),
          ]),
        })
      );
    });

    it("removes rules when rule is deleted", async () => {
      const prevRuleSets: StoredRuleSets = [
        {
          name: "Test Set",
          rules: [
            {
              id: 50,
              action: { type: RuleActionType.BLOCK },
              condition: { requestDomains: ["example.com"] },
            },
            {
              id: 51,
              action: { type: RuleActionType.BLOCK },
              condition: { requestDomains: ["delete-me.com"] },
            },
          ],
        },
      ];
      vi.mocked(mockStore.loadRuleSets).mockResolvedValue(prevRuleSets);
      vi.mocked(mockStore.loadState).mockResolvedValue("enable");
      // Return existing API rules including rule 51 that will be deleted
      vi.mocked(mockDeclarativeNetRequest.getDynamicRules).mockResolvedValue([
        {
          id: 50,
          action: { type: RuleActionType.BLOCK },
          condition: { requestDomains: ["example.com"] },
          priority: 1,
        },
        {
          id: 51,
          action: { type: RuleActionType.BLOCK },
          condition: { requestDomains: ["delete-me.com"] },
          priority: 1,
        },
      ]);

      // Remove rule 51
      const newRuleSets: StoredRuleSets = [
        {
          name: "Test Set",
          rules: [
            {
              id: 50,
              action: { type: RuleActionType.BLOCK },
              condition: { requestDomains: ["example.com"] },
            },
          ],
        },
      ];

      const service = createService();
      await service.updateRuleSets(newRuleSets);

      // Should remove rule 51
      expect(mockDeclarativeNetRequest.updateDynamicRules).toHaveBeenCalledWith(
        expect.objectContaining({
          removeRuleIds: expect.arrayContaining([51]),
        })
      );
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
      const result = await service.updateRuleSets(ruleSets);

      expect(mockStore.saveRuleSets).toHaveBeenCalledWith(ruleSets);
      expect(mockStore.saveRuleSetsRevision).toHaveBeenCalledWith(8);
      expect(result).toEqual({ revision: 8, ruleSets });
      expect(mockEmitter.emit).toHaveBeenCalledWith("updateRuleSets", {
        revision: 8,
        ruleSets,
      });
    });

    it("saves the revision before the rule sets", async () => {
      vi.mocked(mockStore.loadRuleSets).mockResolvedValue([]);

      await createService().updateRuleSets([
        {
          name: "Test Set",
          rules: [
            { id: 1, action: { type: RuleActionType.BLOCK }, condition: {} },
          ],
        },
      ]);

      expect(
        vi.mocked(mockStore.saveRuleSetsRevision).mock.invocationCallOrder[0]
      ).toBeLessThan(
        vi.mocked(mockStore.saveRuleSets).mock.invocationCallOrder[0]
      );
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

  describe("updateRuleSets diff against the current dynamic rules", () => {
    const ruleSets: StoredRuleSets = [
      {
        name: "Test Set",
        rules: [
          {
            id: 50,
            action: { type: RuleActionType.BLOCK },
            condition: {
              requestDomains: ["a.example"],
              initiatorDomains: ["b.example"],
              urlFilter: "ads",
              requestMethods: [RequestMethod.GET],
              resourceTypes: [ResourceType.SCRIPT],
            },
          },
        ],
      },
    ];
    // What convertToApiRule makes of the rule above.
    const applied: ApiRule = {
      id: 50,
      action: { type: RuleActionType.BLOCK },
      condition: {
        requestDomains: ["a.example"],
        initiatorDomains: ["b.example"],
        urlFilter: "ads",
        requestMethods: [RequestMethod.GET],
        resourceTypes: [ResourceType.SCRIPT],
      },
    };

    const updateWith = async (current: ApiRule) => {
      vi.mocked(mockStore.loadState).mockResolvedValue("enable");
      vi.mocked(mockDeclarativeNetRequest.getDynamicRules).mockResolvedValue([
        ...getReservedRules("test-extension-id"),
        current,
      ]);
      await createService().updateRuleSets(structuredClone(ruleSets));
      return vi.mocked(mockDeclarativeNetRequest.updateDynamicRules).mock
        .calls[0][0];
    };

    it("leaves an unchanged rule alone", async () => {
      expect(await updateWith(applied)).toEqual({
        removeRuleIds: [],
        addRules: [],
      });
    });

    it.each<[string, (rule: ApiRule) => void]>([
      ["action", (r) => (r.action = { type: RuleActionType.ALLOW })],
      ["requestDomains", (r) => (r.condition.requestDomains = ["c.example"])],
      [
        "initiatorDomains",
        (r) => (r.condition.initiatorDomains = ["c.example"]),
      ],
      ["urlFilter", (r) => (r.condition.urlFilter = "tracker")],
      ["regexFilter", (r) => (r.condition.regexFilter = "^https://")],
      [
        "requestMethods",
        (r) => (r.condition.requestMethods = [RequestMethod.POST]),
      ],
      [
        "resourceTypes",
        (r) => (r.condition.resourceTypes = [ResourceType.IMAGE]),
      ],
      ["priority", (r) => (r.priority = 2)],
    ])("replaces a rule whose %s differs", async (_, change) => {
      const current = structuredClone(applied);
      change(current);

      expect(await updateWith(current)).toEqual({
        removeRuleIds: [50],
        addRules: [applied],
      });
    });
  });

  describe("stored rules with a regex Chrome does not support", () => {
    const ruleSets: StoredRuleSets = [
      {
        name: "Test Set",
        rules: [
          {
            id: 51,
            action: { type: RuleActionType.BLOCK },
            condition: { isRegexFilter: true, urlFilter: "foo(?=bar)" },
          },
          {
            id: 52,
            action: { type: RuleActionType.BLOCK },
            condition: { isRegexFilter: true, urlFilter: "^https://ads\\." },
          },
        ],
      },
    ];

    const appliedRuleIds = () =>
      vi
        .mocked(mockDeclarativeNetRequest.updateDynamicRules)
        .mock.calls[0][0].addRules?.map((rule) => rule.id);

    beforeEach(() => {
      vi.mocked(mockDeclarativeNetRequest.isRegexSupported).mockImplementation(
        async ({ regex }) =>
          regex === "foo(?=bar)"
            ? { isSupported: false, reason: "syntaxError" }
            : { isSupported: true }
      );
    });

    it("applies the other rules on enable", async () => {
      vi.mocked(mockStore.loadRuleSets).mockResolvedValue(ruleSets);

      await createService().enable();

      expect(appliedRuleIds()).toContain(52);
      expect(appliedRuleIds()).not.toContain(51);
      expect(mockStore.saveState).toHaveBeenCalledWith("enable");
    });

    it("applies the other rules on update and still saves every rule", async () => {
      vi.mocked(mockStore.loadState).mockResolvedValue("enable");

      await createService().updateRuleSets(structuredClone(ruleSets));

      expect(appliedRuleIds()).toContain(52);
      expect(appliedRuleIds()).not.toContain(51);
      expect(mockStore.saveRuleSets).toHaveBeenCalledWith(ruleSets);
    });
  });

  describe("updateRuleSets when applying fails", () => {
    const newRuleSets = (): StoredRuleSets => [
      {
        name: "a",
        rules: [
          { id: 11, action: { type: RuleActionType.ALLOW }, condition: {} },
          {
            id: RULE_ID_UNSAVED,
            action: { type: RuleActionType.BLOCK },
            condition: {},
          },
        ],
      },
    ];

    it("keeps the next rule ID and the caller's rule sets unchanged", async () => {
      vi.mocked(mockStore.loadState).mockResolvedValue("enable");
      vi.mocked(mockDeclarativeNetRequest.updateDynamicRules).mockRejectedValue(
        new Error("apply failed")
      );
      const ruleSets = newRuleSets();

      await expect(createService().updateRuleSets(ruleSets)).rejects.toThrow(
        "apply failed"
      );

      expect(mockStore.saveNextRuleId).not.toHaveBeenCalled();
      expect(mockStore.saveRuleSets).not.toHaveBeenCalled();
      expect(ruleSets).toEqual(newRuleSets());
    });
  });

  describe("overlapping state changes", () => {
    // Like chrome.storage: keeps what was saved and returns copies
    const useStatefulStore = () => {
      let nextRuleId = 100;
      let ruleSets: StoredRuleSets = [];
      vi.mocked(mockStore.loadNextRuleId).mockImplementation(
        async () => nextRuleId
      );
      vi.mocked(mockStore.saveNextRuleId).mockImplementation(async (id) => {
        nextRuleId = id;
      });
      vi.mocked(mockStore.loadRuleSets).mockImplementation(async () =>
        structuredClone(ruleSets)
      );
      vi.mocked(mockStore.saveRuleSets).mockImplementation(async (value) => {
        ruleSets = value;
      });
      let revision = 0;
      vi.mocked(mockStore.loadRuleSetsRevision).mockImplementation(
        async () => revision
      );
      vi.mocked(mockStore.saveRuleSetsRevision).mockImplementation(
        async (value) => {
          revision = value;
        }
      );
    };
    const withNewRule = (name: string): StoredRuleSets => [
      {
        name,
        rules: [
          {
            id: RULE_ID_UNSAVED,
            action: { type: RuleActionType.BLOCK },
            condition: {},
          },
        ],
      },
    ];

    it("gives new rules in overlapping updates different IDs", async () => {
      useStatefulStore();
      vi.mocked(mockStore.loadState).mockResolvedValue("enable");
      const service = createService();

      const [first, second] = await Promise.all([
        service.updateRuleSets(withNewRule("a")),
        service.updateRuleSets(withNewRule("b")),
      ]);

      expect(first).toMatchObject({ revision: 1 });
      expect(first.ruleSets[0].rules[0].id).toBe(100);
      expect(second).toMatchObject({ revision: 2 });
      expect(second.ruleSets[0].rules[0].id).toBe(101);
      expect(mockStore.saveNextRuleId).toHaveBeenLastCalledWith(102);
    });

    it("runs the next change after one that failed", async () => {
      useStatefulStore();
      vi.mocked(mockStore.loadState).mockResolvedValue("enable");
      vi.mocked(
        mockDeclarativeNetRequest.updateDynamicRules
      ).mockRejectedValueOnce(new Error("apply failed"));
      const service = createService();

      const failed = service.updateRuleSets(withNewRule("a"));
      const next = service.updateRuleSets(withNewRule("b"));

      await expect(failed).rejects.toThrow("apply failed");
      expect((await next).ruleSets[0].rules[0].id).toBe(100);
    });

    it("reads the rule sets only after a running update has saved them", async () => {
      useStatefulStore();
      const service = createService();

      const [saved, read] = await Promise.all([
        service.updateRuleSets(withNewRule("a")),
        service.getRuleSets(),
      ]);

      expect(read).toEqual(saved);
    });

    it("applies an import only after a running start has finished", async () => {
      useStatefulStore();
      vi.mocked(mockStore.loadState).mockResolvedValue("enable");
      // Hold start inside its first Chrome call until the import has had a chance to run
      let release = () => {};
      vi.mocked(
        mockDeclarativeNetRequest.getDynamicRules
      ).mockImplementationOnce(
        () => new Promise((resolve) => (release = () => resolve([])))
      );
      const service = createService();

      const started = service.start();
      const imported = service.import({
        format: "BLOCKoli",
        version: 1,
        ruleSets: [
          {
            name: "a",
            rules: [
              {
                action: { type: RuleActionType.BLOCK },
                condition: { requestDomains: ["example.com"] },
              },
            ],
          },
        ],
      });
      await new Promise((resolve) => setTimeout(resolve, 0));
      release();
      await started;
      expect(await imported).toEqual([true, []]);

      const calls = vi.mocked(mockDeclarativeNetRequest.getDynamicRules).mock
        .invocationCallOrder;
      const applied = vi.mocked(mockDeclarativeNetRequest.updateDynamicRules)
        .mock.invocationCallOrder;
      // start reads and writes the dynamic rules before the import reads them
      expect(applied[0]).toBeLessThan(calls[1]);
    });
  });

  describe("rule count limits", () => {
    // One rule is reserved, so two of the three dynamic rules are left for rule sets.
    beforeEach(() => {
      vi.mocked(mockDeclarativeNetRequest.getRuleLimits).mockReturnValue({
        maxDynamicRules: 3,
        maxRegexRules: 1,
      });
      vi.mocked(mockStore.loadState).mockResolvedValue("disable");
    });

    const rule = (id: number, condition: StoredRuleSets[0]["rules"][0]["condition"] = {}) => ({
      id,
      action: { type: RuleActionType.BLOCK },
      condition,
    });
    const regex = { isRegexFilter: true, urlFilter: "^https://" };

    it("refuses to save more rules than Chrome allows, even while disabled", async () => {
      const ruleSets = [
        { name: "a", rules: [rule(11), rule(12), rule(RULE_ID_UNSAVED)] },
      ];

      await expect(createService().updateRuleSets(ruleSets)).rejects.toThrow(
        "Too many rules: 3, but Chrome allows at most 2"
      );
      expect(mockStore.saveNextRuleId).not.toHaveBeenCalled();
      expect(mockStore.saveRuleSets).not.toHaveBeenCalled();
    });

    it("refuses to save more regex rules than Chrome allows", async () => {
      const ruleSets = [{ name: "a", rules: [rule(11, regex), rule(12, regex)] }];

      await expect(createService().updateRuleSets(ruleSets)).rejects.toThrow(
        "Too many regex rules: 2, but Chrome allows at most 1"
      );
      expect(mockStore.saveRuleSets).not.toHaveBeenCalled();
    });

    it("saves rules up to the limits", async () => {
      const ruleSets = [
        {
          name: "a",
          rules: [rule(11, regex), rule(12, { isRegexFilter: true })],
        },
      ];

      await createService().updateRuleSets(ruleSets);

      expect(mockStore.saveRuleSets).toHaveBeenCalledWith(ruleSets);
    });

    it("refuses to enable when stored rules are over the limit", async () => {
      vi.mocked(mockStore.loadRuleSets).mockResolvedValue([
        { name: "a", rules: [rule(11), rule(12), rule(13)] },
      ]);

      await expect(createService().enable()).rejects.toThrow(
        "Too many rules: 3, but Chrome allows at most 2"
      );
      expect(mockDeclarativeNetRequest.updateDynamicRules).not.toHaveBeenCalled();
      expect(mockStore.saveState).not.toHaveBeenCalled();
    });
  });

describe("getMatchedRules for rules no longer stored", () => {
    it("drops a matched rule whose id is not in any rule set", async () => {
      vi.mocked(mockStore.loadRuleSets).mockResolvedValue([]);
      vi.mocked(
        mockDeclarativeNetRequest.getMatchedRulesInActiveTab
      ).mockResolvedValue([
        { rule: { ruleId: 99 }, timeStamp: 1234567890, tabId: 1 },
      ]);

      expect(await createService().getMatchedRules()).toEqual([]);
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

    it("rejects a regex that Chrome does not support without applying", async () => {
      vi.mocked(mockStore.loadRuleSets).mockResolvedValue([]);
      vi.mocked(mockStore.loadState).mockResolvedValue("enable");
      vi.mocked(mockDeclarativeNetRequest.isRegexSupported).mockResolvedValue({
        isSupported: false,
        reason: "syntaxError",
      });

      const importData = {
        format: "BLOCKoli",
        version: 1,
        ruleSets: [
          {
            name: "Imported Set",
            rules: [
              {
                action: { type: RuleActionType.BLOCK },
                condition: { urlFilter: "foo(?=bar)", isRegexFilter: true },
              },
            ],
          },
        ],
      };

      const service = createService();
      const [valid, errors] = await service.import(importData);

      expect(valid).toBe(false);
      expect(errors).toEqual([
        {
          ruleSetNumber: 0,
          ruleSetField: "rules",
          ruleNumber: 0,
          ruleField: "condition.urlFilter",
          message: "syntaxError",
        },
      ]);
      expect(mockDeclarativeNetRequest.isRegexSupported).toHaveBeenCalledWith({
        regex: "foo(?=bar)",
        isCaseSensitive: false,
      });
      expect(mockDeclarativeNetRequest.updateDynamicRules).not.toHaveBeenCalled();
      expect(mockStore.saveRuleSets).not.toHaveBeenCalled();
    });
  });
});
