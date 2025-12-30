import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ChromeStorageApiImpl } from "./storage";

describe("ChromeStorageApiImpl", () => {
  let mockGet: ReturnType<typeof vi.fn>;
  let mockSet: ReturnType<typeof vi.fn>;
  let mockRemove: ReturnType<typeof vi.fn>;
  let mockStorageArea: chrome.storage.StorageArea;

  beforeEach(() => {
    mockGet = vi.fn();
    mockSet = vi.fn();
    mockRemove = vi.fn();

    mockStorageArea = {
      get: mockGet,
      set: mockSet,
      remove: mockRemove,
    } as unknown as chrome.storage.StorageArea;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("get", () => {
    it("returns value for existing key", async () => {
      mockGet.mockResolvedValue({ testKey: "testValue" });

      const api = new ChromeStorageApiImpl(mockStorageArea);
      const result = await api.get<string>("testKey");

      expect(result).toBe("testValue");
      expect(mockGet).toHaveBeenCalledWith("testKey");
    });

    it("returns undefined for non-existing key", async () => {
      mockGet.mockResolvedValue({});

      const api = new ChromeStorageApiImpl(mockStorageArea);
      const result = await api.get<string>("nonExistentKey");

      expect(result).toBeUndefined();
    });

    it("returns object value", async () => {
      const objectValue = { name: "test", count: 42 };
      mockGet.mockResolvedValue({ objectKey: objectValue });

      const api = new ChromeStorageApiImpl(mockStorageArea);
      const result = await api.get<{ name: string; count: number }>("objectKey");

      expect(result).toEqual(objectValue);
    });

    it("returns array value", async () => {
      const arrayValue = [1, 2, 3, 4, 5];
      mockGet.mockResolvedValue({ arrayKey: arrayValue });

      const api = new ChromeStorageApiImpl(mockStorageArea);
      const result = await api.get<number[]>("arrayKey");

      expect(result).toEqual(arrayValue);
    });

    it("returns null value when stored", async () => {
      mockGet.mockResolvedValue({ nullKey: null });

      const api = new ChromeStorageApiImpl(mockStorageArea);
      const result = await api.get<null>("nullKey");

      expect(result).toBeNull();
    });

    it("returns boolean value", async () => {
      mockGet.mockResolvedValue({ boolKey: true });

      const api = new ChromeStorageApiImpl(mockStorageArea);
      const result = await api.get<boolean>("boolKey");

      expect(result).toBe(true);
    });
  });

  describe("set", () => {
    it("sets string value", async () => {
      mockSet.mockResolvedValue(undefined);

      const api = new ChromeStorageApiImpl(mockStorageArea);
      await api.set("testKey", "testValue");

      expect(mockSet).toHaveBeenCalledWith({ testKey: "testValue" });
    });

    it("sets object value", async () => {
      mockSet.mockResolvedValue(undefined);
      const objectValue = { name: "test", count: 42 };

      const api = new ChromeStorageApiImpl(mockStorageArea);
      await api.set("objectKey", objectValue);

      expect(mockSet).toHaveBeenCalledWith({ objectKey: objectValue });
    });

    it("sets array value", async () => {
      mockSet.mockResolvedValue(undefined);
      const arrayValue = [1, 2, 3];

      const api = new ChromeStorageApiImpl(mockStorageArea);
      await api.set("arrayKey", arrayValue);

      expect(mockSet).toHaveBeenCalledWith({ arrayKey: arrayValue });
    });

    it("sets null value", async () => {
      mockSet.mockResolvedValue(undefined);

      const api = new ChromeStorageApiImpl(mockStorageArea);
      await api.set("nullKey", null);

      expect(mockSet).toHaveBeenCalledWith({ nullKey: null });
    });

    it("sets boolean value", async () => {
      mockSet.mockResolvedValue(undefined);

      const api = new ChromeStorageApiImpl(mockStorageArea);
      await api.set("boolKey", false);

      expect(mockSet).toHaveBeenCalledWith({ boolKey: false });
    });

    it("sets number value", async () => {
      mockSet.mockResolvedValue(undefined);

      const api = new ChromeStorageApiImpl(mockStorageArea);
      await api.set("numberKey", 123.45);

      expect(mockSet).toHaveBeenCalledWith({ numberKey: 123.45 });
    });
  });

  describe("remove", () => {
    it("removes item by key", async () => {
      mockRemove.mockResolvedValue(undefined);

      const api = new ChromeStorageApiImpl(mockStorageArea);
      await api.remove("testKey");

      expect(mockRemove).toHaveBeenCalledWith("testKey");
    });

    it("handles removing non-existent key", async () => {
      mockRemove.mockResolvedValue(undefined);

      const api = new ChromeStorageApiImpl(mockStorageArea);
      await api.remove("nonExistentKey");

      expect(mockRemove).toHaveBeenCalledWith("nonExistentKey");
    });
  });

  describe("with different storage areas", () => {
    it("works with local storage", async () => {
      const localStorageArea = {
        get: vi.fn().mockResolvedValue({ key: "local" }),
        set: vi.fn().mockResolvedValue(undefined),
        remove: vi.fn().mockResolvedValue(undefined),
      } as unknown as chrome.storage.StorageArea;

      const api = new ChromeStorageApiImpl(localStorageArea);
      const result = await api.get<string>("key");

      expect(result).toBe("local");
    });

    it("works with sync storage", async () => {
      const syncStorageArea = {
        get: vi.fn().mockResolvedValue({ key: "sync" }),
        set: vi.fn().mockResolvedValue(undefined),
        remove: vi.fn().mockResolvedValue(undefined),
      } as unknown as chrome.storage.StorageArea;

      const api = new ChromeStorageApiImpl(syncStorageArea);
      const result = await api.get<string>("key");

      expect(result).toBe("sync");
    });
  });
});
