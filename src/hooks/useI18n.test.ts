import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  useI18n,
  updateI18nLanguage,
  getLocalizedValidationErrorText,
  I18nMessageMap,
} from "./useI18n";

describe("useI18n", () => {
  beforeEach(() => {
    // Reset language to null before each test
    updateI18nLanguage(null);
    // Mock chrome.i18n as undefined to test fallback behavior
    vi.stubGlobal("chrome", {});
  });

  describe("updateI18nLanguage", () => {
    it("sets language to ja", () => {
      updateI18nLanguage("ja");
      const i18n = useI18n();
      expect(i18n["Options"]).toBe("設定");
    });

    it("sets language to en", () => {
      updateI18nLanguage("en");
      const i18n = useI18n();
      expect(i18n["Options"]).toBe("Options");
    });

    it("defaults to en for unknown language", () => {
      updateI18nLanguage("fr");
      const i18n = useI18n();
      expect(i18n["Options"]).toBe("Options");
    });

    it("resets language to null", () => {
      updateI18nLanguage("ja");
      updateI18nLanguage(null);
      const i18n = useI18n();
      // When language is null and chrome.i18n is not available, falls back to en
      expect(i18n["Options"]).toBe("Options");
    });
  });

  describe("useI18n", () => {
    it("returns a message map proxy", () => {
      updateI18nLanguage("en");
      const i18n = useI18n();
      expect(i18n).toBeDefined();
    });

    it("returns English messages when language is en", () => {
      updateI18nLanguage("en");
      const i18n = useI18n();
      expect(i18n["EnableRules"]).toBe("Enable rules");
      expect(i18n["RuleSets"]).toBe("Rule Sets");
    });

    it("returns Japanese messages when language is ja", () => {
      updateI18nLanguage("ja");
      const i18n = useI18n();
      expect(i18n["EnableRules"]).toBe("ルールを有効にする");
      expect(i18n["RuleSets"]).toBe("ルールセット一覧");
    });

    it("returns empty string for non-existent key", () => {
      updateI18nLanguage("en");
      const i18n = useI18n();
      expect(i18n["nonExistentKey"]).toBe("");
    });

    it("uses chrome.i18n.getMessage when language is null and chrome.i18n is available", () => {
      const mockGetMessage = vi.fn().mockReturnValue("Mocked Message");
      vi.stubGlobal("chrome", {
        i18n: {
          getMessage: mockGetMessage,
        },
      });
      updateI18nLanguage(null);

      const i18n = useI18n();
      const result = i18n["testKey"];

      expect(mockGetMessage).toHaveBeenCalledWith("testKey");
      expect(result).toBe("Mocked Message");
    });
  });

  describe("getLocalizedValidationErrorText", () => {
    it("returns translated text when key exists", () => {
      const mockI18n: I18nMessageMap = {
        must_be_object: "オブジェクトでなければなりません",
      };
      const result = getLocalizedValidationErrorText("must be object", mockI18n);
      expect(result).toBe("オブジェクトでなければなりません");
    });

    it("returns original text when key does not exist", () => {
      const mockI18n: I18nMessageMap = {};
      const result = getLocalizedValidationErrorText("unknown error", mockI18n);
      expect(result).toBe("unknown error");
    });

    it("converts spaces to underscores", () => {
      const mockI18n: I18nMessageMap = {
        must_be_array: "配列でなければなりません",
      };
      const result = getLocalizedValidationErrorText("must be array", mockI18n);
      expect(result).toBe("配列でなければなりません");
    });

    it("converts hyphens to underscores", () => {
      const mockI18n: I18nMessageMap = {
        must_not_be_empty: "空であってはなりません",
      };
      const result = getLocalizedValidationErrorText("must-not-be-empty", mockI18n);
      expect(result).toBe("空であってはなりません");
    });

    it("removes non-word characters", () => {
      const mockI18n: I18nMessageMap = {
        must_be_valid: "有効でなければなりません",
      };
      const result = getLocalizedValidationErrorText("must be valid!", mockI18n);
      expect(result).toBe("有効でなければなりません");
    });

    it("converts to lowercase", () => {
      const mockI18n: I18nMessageMap = {
        must_be_string: "文字列でなければなりません",
      };
      const result = getLocalizedValidationErrorText("MUST BE STRING", mockI18n);
      expect(result).toBe("文字列でなければなりません");
    });

    it("handles complex transformation", () => {
      const mockI18n: I18nMessageMap = {
        must_not_have_additional_properties: "追加プロパティを持ってはなりません",
      };
      const result = getLocalizedValidationErrorText(
        "must NOT have additional properties",
        mockI18n
      );
      expect(result).toBe("追加プロパティを持ってはなりません");
    });
  });
});
