import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ChromeStorageApi } from "@/modules/chrome/api";
import { RuleActionType } from "@/modules/core/rules";
import { RESERVED_RULE_ID_MAX } from "@/modules/rules/reserved";
import type { StoredRuleSets } from "@/modules/rules/stored";
import { ServiceConfigurationStoreImpl } from "./ServiceConfigurationStoreImpl";

describe("ServiceConfigurationStoreImpl", () => {
  let mockStorage: ChromeStorageApi;

  const createStore = () => {
    return new ServiceConfigurationStoreImpl(mockStorage);
  };

  beforeEach(() => {
    vi.resetAllMocks();

    mockStorage = {
      get: vi.fn().mockResolvedValue(undefined),
      set: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
    } as unknown as ChromeStorageApi;
  });

  describe("constructor", () => {
    it("creates instance with storage dependency", () => {
      const store = createStore();
      expect(store).toBeInstanceOf(ServiceConfigurationStoreImpl);
    });
  });

  describe("saveState", () => {
    it("saves enable state", async () => {
      const store = createStore();
      await store.saveState("enable");

      expect(mockStorage.set).toHaveBeenCalledWith("state", "enable");
    });

    it("saves disable state", async () => {
      const store = createStore();
      await store.saveState("disable");

      expect(mockStorage.set).toHaveBeenCalledWith("state", "disable");
    });
  });

  describe("loadState", () => {
    it("returns stored state when available", async () => {
      vi.mocked(mockStorage.get).mockResolvedValue("enable");

      const store = createStore();
      const result = await store.loadState();

      expect(mockStorage.get).toHaveBeenCalledWith("state");
      expect(result).toBe("enable");
    });

    it("returns disable as default when not stored", async () => {
      vi.mocked(mockStorage.get).mockResolvedValue(undefined);

      const store = createStore();
      const result = await store.loadState();

      expect(result).toBe("disable");
    });

    it("returns disable as default when null", async () => {
      vi.mocked(mockStorage.get).mockResolvedValue(null);

      const store = createStore();
      const result = await store.loadState();

      expect(result).toBe("disable");
    });
  });

  describe("saveNextRuleId", () => {
    it("saves next rule id", async () => {
      const store = createStore();
      await store.saveNextRuleId(42);

      expect(mockStorage.set).toHaveBeenCalledWith("nextRuleId", 42);
    });
  });

  describe("loadNextRuleId", () => {
    it("returns stored next rule id when available", async () => {
      vi.mocked(mockStorage.get).mockResolvedValue(100);

      const store = createStore();
      const result = await store.loadNextRuleId();

      expect(mockStorage.get).toHaveBeenCalledWith("nextRuleId");
      expect(result).toBe(100);
    });

    it("returns RESERVED_RULE_ID_MAX + 1 as default when not stored", async () => {
      vi.mocked(mockStorage.get).mockResolvedValue(undefined);

      const store = createStore();
      const result = await store.loadNextRuleId();

      expect(result).toBe(RESERVED_RULE_ID_MAX + 1);
    });

    it("returns RESERVED_RULE_ID_MAX + 1 as default when null", async () => {
      vi.mocked(mockStorage.get).mockResolvedValue(null);

      const store = createStore();
      const result = await store.loadNextRuleId();

      expect(result).toBe(RESERVED_RULE_ID_MAX + 1);
    });
  });

  describe("saveRuleSets", () => {
    it("saves rule sets", async () => {
      const ruleSets: StoredRuleSets = [
        {
          name: "Test Set",
          rules: [
            { id: 1, action: { type: RuleActionType.BLOCK }, condition: {} },
          ],
        },
      ];

      const store = createStore();
      await store.saveRuleSets(ruleSets);

      expect(mockStorage.set).toHaveBeenCalledWith("ruleSets", ruleSets);
    });

    it("saves empty rule sets", async () => {
      const store = createStore();
      await store.saveRuleSets([]);

      expect(mockStorage.set).toHaveBeenCalledWith("ruleSets", []);
    });
  });

  describe("loadRuleSets", () => {
    it("returns stored rule sets when available", async () => {
      const ruleSets: StoredRuleSets = [
        {
          name: "Test Set",
          rules: [
            { id: 1, action: { type: RuleActionType.BLOCK }, condition: {} },
          ],
        },
      ];
      vi.mocked(mockStorage.get).mockResolvedValue(ruleSets);

      const store = createStore();
      const result = await store.loadRuleSets();

      expect(mockStorage.get).toHaveBeenCalledWith("ruleSets");
      expect(result).toEqual(ruleSets);
    });

    it("returns empty array as default when not stored", async () => {
      vi.mocked(mockStorage.get).mockResolvedValue(undefined);

      const store = createStore();
      const result = await store.loadRuleSets();

      expect(result).toEqual([]);
    });

    it("returns empty array as default when null", async () => {
      vi.mocked(mockStorage.get).mockResolvedValue(null);

      const store = createStore();
      const result = await store.loadRuleSets();

      expect(result).toEqual([]);
    });
  });

  describe("saveLanguage", () => {
    it("saves language when provided", async () => {
      const store = createStore();
      await store.saveLanguage("ja");

      expect(mockStorage.set).toHaveBeenCalledWith("language", "ja");
      expect(mockStorage.remove).not.toHaveBeenCalled();
    });

    it("removes language when undefined", async () => {
      const store = createStore();
      await store.saveLanguage(undefined);

      expect(mockStorage.remove).toHaveBeenCalledWith("language");
      expect(mockStorage.set).not.toHaveBeenCalled();
    });

    it("removes language when empty string", async () => {
      const store = createStore();
      await store.saveLanguage("");

      expect(mockStorage.remove).toHaveBeenCalledWith("language");
      expect(mockStorage.set).not.toHaveBeenCalled();
    });
  });

  describe("loadLanguage", () => {
    it("returns stored language when available", async () => {
      vi.mocked(mockStorage.get).mockResolvedValue("ja");

      const store = createStore();
      const result = await store.loadLanguage();

      expect(mockStorage.get).toHaveBeenCalledWith("language");
      expect(result).toBe("ja");
    });

    it("returns undefined when not stored", async () => {
      vi.mocked(mockStorage.get).mockResolvedValue(undefined);

      const store = createStore();
      const result = await store.loadLanguage();

      expect(result).toBeUndefined();
    });
  });
});
