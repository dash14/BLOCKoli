import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { UnsupportedRegexReason } from "./api";
import { createRegexValidator } from "./regex";

// Mock logging for declarativeNetRequest
vi.mock("@/modules/utils/logging", () => ({
  default: {
    getLogger: () => ({
      debug: vi.fn(),
    }),
  },
}));

describe("createRegexValidator", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("when running as extension", () => {
    let mockIsRegexSupported: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockIsRegexSupported = vi.fn();

      vi.stubGlobal("chrome", {
        declarativeNetRequest: {
          isRegexSupported: mockIsRegexSupported,
        },
      });
    });

    it("uses chrome.declarativeNetRequest.isRegexSupported", async () => {
      mockIsRegexSupported.mockResolvedValue({ isSupported: true });

      const validator = createRegexValidator();
      const result = await validator(".*\\.js$", true);

      expect(result).toEqual({ isSupported: true });
      expect(mockIsRegexSupported).toHaveBeenCalledWith({
        regex: ".*\\.js$",
        isCaseSensitive: true,
        requireCapturing: false,
      });
    });

    it("passes isCaseSensitive parameter correctly", async () => {
      mockIsRegexSupported.mockResolvedValue({ isSupported: true });

      const validator = createRegexValidator();
      await validator("test", false);

      expect(mockIsRegexSupported).toHaveBeenCalledWith({
        regex: "test",
        isCaseSensitive: false,
        requireCapturing: false,
      });
    });

    it("returns unsupported result from chrome API", async () => {
      mockIsRegexSupported.mockResolvedValue({
        isSupported: false,
        reason: UnsupportedRegexReason.SYNTAX_ERROR,
      });

      const validator = createRegexValidator();
      const result = await validator("[invalid", true);

      expect(result).toEqual({
        isSupported: false,
        reason: UnsupportedRegexReason.SYNTAX_ERROR,
      });
    });

    it("returns memory limit exceeded reason", async () => {
      mockIsRegexSupported.mockResolvedValue({
        isSupported: false,
        reason: UnsupportedRegexReason.MEMORY_LIMIT_EXCEEDED,
      });

      const validator = createRegexValidator();
      const result = await validator("(.+)+", true);

      expect(result).toEqual({
        isSupported: false,
        reason: UnsupportedRegexReason.MEMORY_LIMIT_EXCEEDED,
      });
    });
  });

  describe("when not running as extension", () => {
    beforeEach(() => {
      vi.stubGlobal("chrome", {
        // No declarativeNetRequest - simulates non-extension environment
      });
    });

    it("uses JavaScript RegExp for validation", async () => {
      const validator = createRegexValidator();
      const result = await validator(".*\\.js$", true);

      expect(result).toEqual({ isSupported: true });
    });

    it("validates case-insensitive regex", async () => {
      const validator = createRegexValidator();
      const result = await validator("test", false);

      expect(result).toEqual({ isSupported: true });
    });

    it("returns syntax error for invalid regex", async () => {
      const validator = createRegexValidator();
      const result = await validator("[invalid", true);

      expect(result).toEqual({
        isSupported: false,
        reason: UnsupportedRegexReason.SYNTAX_ERROR,
      });
    });

    it("returns syntax error for unclosed group", async () => {
      const validator = createRegexValidator();
      const result = await validator("(unclosed", true);

      expect(result).toEqual({
        isSupported: false,
        reason: UnsupportedRegexReason.SYNTAX_ERROR,
      });
    });

    it("validates complex valid regex", async () => {
      const validator = createRegexValidator();
      const result = await validator(
        "^https?://([a-z0-9-]+\\.)+example\\.com/.*$",
        true
      );

      expect(result).toEqual({ isSupported: true });
    });

    it("validates regex with flags equivalent", async () => {
      const validator = createRegexValidator();

      // Case sensitive
      const resultSensitive = await validator("Test", true);
      expect(resultSensitive).toEqual({ isSupported: true });

      // Case insensitive
      const resultInsensitive = await validator("Test", false);
      expect(resultInsensitive).toEqual({ isSupported: true });
    });
  });
});
