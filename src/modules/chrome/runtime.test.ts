import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ChromeRuntimeApiImpl } from "./runtime";

describe("ChromeRuntimeApiImpl", () => {
  let mockGetURL: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGetURL = vi.fn();

    vi.stubGlobal("chrome", {
      runtime: {
        id: "test-extension-id",
        getURL: mockGetURL,
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("getId", () => {
    it("returns chrome.runtime.id", () => {
      const api = new ChromeRuntimeApiImpl();
      const result = api.getId();

      expect(result).toBe("test-extension-id");
    });

    it("returns different extension ids", () => {
      vi.stubGlobal("chrome", {
        runtime: {
          id: "another-extension-id",
          getURL: mockGetURL,
        },
      });

      const api = new ChromeRuntimeApiImpl();
      const result = api.getId();

      expect(result).toBe("another-extension-id");
    });
  });

  describe("getURL", () => {
    it("returns URL from chrome.runtime.getURL", () => {
      mockGetURL.mockReturnValue("chrome-extension://test-extension-id/popup.html");

      const api = new ChromeRuntimeApiImpl();
      const result = api.getURL("popup.html");

      expect(result).toBe("chrome-extension://test-extension-id/popup.html");
      expect(mockGetURL).toHaveBeenCalledWith("popup.html");
    });

    it("handles paths with subdirectories", () => {
      mockGetURL.mockReturnValue(
        "chrome-extension://test-extension-id/assets/icons/icon16.png"
      );

      const api = new ChromeRuntimeApiImpl();
      const result = api.getURL("assets/icons/icon16.png");

      expect(result).toBe(
        "chrome-extension://test-extension-id/assets/icons/icon16.png"
      );
      expect(mockGetURL).toHaveBeenCalledWith("assets/icons/icon16.png");
    });

    it("handles root path", () => {
      mockGetURL.mockReturnValue("chrome-extension://test-extension-id/");

      const api = new ChromeRuntimeApiImpl();
      const result = api.getURL("");

      expect(result).toBe("chrome-extension://test-extension-id/");
      expect(mockGetURL).toHaveBeenCalledWith("");
    });

    it("handles absolute paths", () => {
      mockGetURL.mockReturnValue(
        "chrome-extension://test-extension-id/manifest.json"
      );

      const api = new ChromeRuntimeApiImpl();
      const result = api.getURL("/manifest.json");

      expect(result).toBe("chrome-extension://test-extension-id/manifest.json");
      expect(mockGetURL).toHaveBeenCalledWith("/manifest.json");
    });
  });
});
