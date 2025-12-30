import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ChromeActionApiImpl } from "./action";

describe("ChromeActionApiImpl", () => {
  let mockSetIcon: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSetIcon = vi.fn();

    vi.stubGlobal("chrome", {
      action: {
        setIcon: mockSetIcon,
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("setIcon", () => {
    it("calls chrome.action.setIcon with string path", () => {
      const api = new ChromeActionApiImpl();

      api.setIcon({ path: "icons/icon16.png" });

      expect(mockSetIcon).toHaveBeenCalledWith({ path: "icons/icon16.png" });
    });

    it("calls chrome.action.setIcon with dictionary path", () => {
      const api = new ChromeActionApiImpl();
      const pathDict = {
        "16": "icons/icon16.png",
        "32": "icons/icon32.png",
        "48": "icons/icon48.png",
      };

      api.setIcon({ path: pathDict });

      expect(mockSetIcon).toHaveBeenCalledWith({ path: pathDict });
    });

    it("calls chrome.action.setIcon with undefined path", () => {
      const api = new ChromeActionApiImpl();

      api.setIcon({});

      expect(mockSetIcon).toHaveBeenCalledWith({});
    });
  });
});
