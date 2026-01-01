import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ChromeActionApiImpl } from "./action";
import { ChromeDeclarativeNetRequestApiImpl } from "./declarativeNetRequest";
import { ChromeApiFactory } from "./factory";
import { ChromeI18nApiImpl } from "./i18n";
import { ChromeRuntimeApiImpl } from "./runtime";
import { ChromeStorageApiImpl } from "./storage";

// Mock logging for declarativeNetRequest
vi.mock("@/modules/utils/logging", () => ({
  default: {
    getLogger: () => ({
      debug: vi.fn(),
    }),
  },
}));

describe("ChromeApiFactory", () => {
  beforeEach(() => {
    vi.stubGlobal("chrome", {
      declarativeNetRequest: {},
      storage: {
        local: {
          get: vi.fn(),
          set: vi.fn(),
          remove: vi.fn(),
        },
      },
      action: {
        setIcon: vi.fn(),
      },
      runtime: {
        id: "test-extension-id",
        getURL: vi.fn((path: string) => `chrome-extension://test/${path}`),
      },
      i18n: {
        getUILanguage: vi.fn(() => "en"),
        getMessage: vi.fn((key: string) => key),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("isExtension", () => {
    it("returns true when chrome.declarativeNetRequest exists", () => {
      const factory = new ChromeApiFactory();

      expect(factory.isExtension()).toBe(true);
    });

    it("returns false when chrome.declarativeNetRequest does not exist", () => {
      vi.stubGlobal("chrome", {
        storage: { local: {} },
      });

      const factory = new ChromeApiFactory();

      expect(factory.isExtension()).toBe(false);
    });
  });

  describe("storage", () => {
    it("returns ChromeStorageApiImpl instance", () => {
      const factory = new ChromeApiFactory();
      const storage = factory.storage();

      expect(storage).toBeInstanceOf(ChromeStorageApiImpl);
    });

    it("returns new instance on each call", () => {
      const factory = new ChromeApiFactory();
      const storage1 = factory.storage();
      const storage2 = factory.storage();

      expect(storage1).not.toBe(storage2);
    });
  });

  describe("declarativeNetRequest", () => {
    it("returns ChromeDeclarativeNetRequestApiImpl instance", () => {
      const factory = new ChromeApiFactory();
      const api = factory.declarativeNetRequest();

      expect(api).toBeInstanceOf(ChromeDeclarativeNetRequestApiImpl);
    });

    it("returns new instance on each call", () => {
      const factory = new ChromeApiFactory();
      const api1 = factory.declarativeNetRequest();
      const api2 = factory.declarativeNetRequest();

      expect(api1).not.toBe(api2);
    });
  });

  describe("action", () => {
    it("returns ChromeActionApiImpl instance", () => {
      const factory = new ChromeApiFactory();
      const action = factory.action();

      expect(action).toBeInstanceOf(ChromeActionApiImpl);
    });

    it("returns new instance on each call", () => {
      const factory = new ChromeApiFactory();
      const action1 = factory.action();
      const action2 = factory.action();

      expect(action1).not.toBe(action2);
    });
  });

  describe("runtime", () => {
    it("returns ChromeRuntimeApiImpl instance", () => {
      const factory = new ChromeApiFactory();
      const runtime = factory.runtime();

      expect(runtime).toBeInstanceOf(ChromeRuntimeApiImpl);
    });

    it("returns new instance on each call", () => {
      const factory = new ChromeApiFactory();
      const runtime1 = factory.runtime();
      const runtime2 = factory.runtime();

      expect(runtime1).not.toBe(runtime2);
    });
  });

  describe("i18n", () => {
    it("returns ChromeI18nApiImpl instance", () => {
      const factory = new ChromeApiFactory();
      const i18n = factory.i18n();

      expect(i18n).toBeInstanceOf(ChromeI18nApiImpl);
    });

    it("returns new instance on each call", () => {
      const factory = new ChromeApiFactory();
      const i18n1 = factory.i18n();
      const i18n2 = factory.i18n();

      expect(i18n1).not.toBe(i18n2);
    });
  });
});
