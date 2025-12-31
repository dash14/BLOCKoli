import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ChromeI18nApiImpl } from "./i18n";

describe("ChromeI18nApiImpl", () => {
  let mockGetUILanguage: ReturnType<typeof vi.fn>;
  let mockGetMessage: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGetUILanguage = vi.fn();
    mockGetMessage = vi.fn();

    vi.stubGlobal("chrome", {
      i18n: {
        getUILanguage: mockGetUILanguage,
        getMessage: mockGetMessage,
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("getUILanguage", () => {
    it("returns language from chrome.i18n.getUILanguage", () => {
      mockGetUILanguage.mockReturnValue("en");

      const api = new ChromeI18nApiImpl();
      const result = api.getUILanguage();

      expect(result).toBe("en");
      expect(mockGetUILanguage).toHaveBeenCalled();
    });

    it("returns different languages", () => {
      mockGetUILanguage.mockReturnValue("ja");

      const api = new ChromeI18nApiImpl();
      const result = api.getUILanguage();

      expect(result).toBe("ja");
    });

    it("returns language with region code", () => {
      mockGetUILanguage.mockReturnValue("en-US");

      const api = new ChromeI18nApiImpl();
      const result = api.getUILanguage();

      expect(result).toBe("en-US");
    });
  });

  describe("getMessage", () => {
    it("returns message from chrome.i18n.getMessage", () => {
      mockGetMessage.mockReturnValue("Hello World");

      const api = new ChromeI18nApiImpl();
      const result = api.getMessage("greeting");

      expect(result).toBe("Hello World");
      expect(mockGetMessage).toHaveBeenCalledWith("greeting", undefined);
    });

    it("returns message with string substitution", () => {
      mockGetMessage.mockReturnValue("Hello, John!");

      const api = new ChromeI18nApiImpl();
      const result = api.getMessage("greetingWithName", "John");

      expect(result).toBe("Hello, John!");
      expect(mockGetMessage).toHaveBeenCalledWith("greetingWithName", "John");
    });

    it("returns message with array substitutions", () => {
      mockGetMessage.mockReturnValue("Hello, John Doe!");

      const api = new ChromeI18nApiImpl();
      const result = api.getMessage("greetingWithFullName", ["John", "Doe"]);

      expect(result).toBe("Hello, John Doe!");
      expect(mockGetMessage).toHaveBeenCalledWith("greetingWithFullName", [
        "John",
        "Doe",
      ]);
    });

    it("returns empty string for missing message", () => {
      mockGetMessage.mockReturnValue("");

      const api = new ChromeI18nApiImpl();
      const result = api.getMessage("nonExistentKey");

      expect(result).toBe("");
    });

    it("handles undefined substitutions", () => {
      mockGetMessage.mockReturnValue("Test message");

      const api = new ChromeI18nApiImpl();
      const result = api.getMessage("testKey", undefined);

      expect(result).toBe("Test message");
      expect(mockGetMessage).toHaveBeenCalledWith("testKey", undefined);
    });
  });
});
