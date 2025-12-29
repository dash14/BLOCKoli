import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useRequestBlockClient } from "./useRequestBlockClient";

// Mock chrome.runtime API
const mockSendMessage = vi.fn();
const mockAddListener = vi.fn();
const mockRemoveListener = vi.fn();

vi.stubGlobal("chrome", {
  runtime: {
    sendMessage: mockSendMessage,
    onMessage: {
      addListener: mockAddListener,
      removeListener: mockRemoveListener,
    },
  },
});

// Mock updateI18nLanguage
vi.mock("./useI18n", () => ({
  updateI18nLanguage: vi.fn(),
}));

describe("useRequestBlockClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock responses
    mockSendMessage.mockImplementation(async (request) => {
      if (request.method === "isEnabled") {
        return { type: "response", success: true, result: false };
      }
      if (request.method === "getRuleSets") {
        return { type: "response", success: true, result: [] };
      }
      if (request.method === "getLanguage") {
        return { type: "response", success: true, result: "en" };
      }
      if (request.method === "enable") {
        return { type: "response", success: true, result: undefined };
      }
      if (request.method === "disable") {
        return { type: "response", success: true, result: undefined };
      }
      if (request.method === "updateRuleSets") {
        return { type: "response", success: true, result: undefined };
      }
      if (request.method === "getMatchedRules") {
        return { type: "response", success: true, result: [] };
      }
      if (request.method === "setLanguage") {
        return { type: "response", success: true, result: undefined };
      }
      if (request.method === "export") {
        return { type: "response", success: true, result: { version: 1, ruleSets: [] } };
      }
      if (request.method === "import") {
        return { type: "response", success: true, result: [true, []] };
      }
      return { type: "response", success: true, result: null };
    });
  });

  it("initializes with default values", () => {
    const { result } = renderHook(() => useRequestBlockClient());

    expect(result.current.loaded).toBe(false);
    expect(result.current.enabled).toBe(false);
    expect(result.current.ruleSets).toStrictEqual([]);
    expect(result.current.language).toBe("en");
  });

  it("loads initial state from service", async () => {
    mockSendMessage.mockImplementation(async (request) => {
      if (request.method === "isEnabled") {
        return { type: "response", success: true, result: true };
      }
      if (request.method === "getRuleSets") {
        return {
          type: "response",
          success: true,
          result: [{ name: "Test Set", rules: [] }],
        };
      }
      if (request.method === "getLanguage") {
        return { type: "response", success: true, result: "ja" };
      }
      return { type: "response", success: true, result: null };
    });

    const { result } = renderHook(() => useRequestBlockClient());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    expect(result.current.enabled).toBe(true);
    expect(result.current.ruleSets).toStrictEqual([{ name: "Test Set", rules: [] }]);
    expect(result.current.language).toBe("ja");
  });

  it("changeState calls enable when enabled is true", async () => {
    const { result } = renderHook(() => useRequestBlockClient());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    await act(async () => {
      await result.current.changeState(true);
    });

    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "request",
        method: "enable",
      })
    );
  });

  it("changeState calls disable when enabled is false", async () => {
    const { result } = renderHook(() => useRequestBlockClient());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    await act(async () => {
      await result.current.changeState(false);
    });

    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "request",
        method: "disable",
      })
    );
  });

  it("updateRuleSets calls service when ruleSets changed", async () => {
    const { result } = renderHook(() => useRequestBlockClient());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    const newRuleSets = [{ name: "New Set", rules: [] }];

    await act(async () => {
      await result.current.updateRuleSets(newRuleSets);
    });

    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "request",
        method: "updateRuleSets",
        args: [newRuleSets],
      })
    );
  });

  it("updateRuleSets does not call service when ruleSets unchanged", async () => {
    const { result } = renderHook(() => useRequestBlockClient());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    mockSendMessage.mockClear();

    await act(async () => {
      await result.current.updateRuleSets([]);
    });

    expect(mockSendMessage).not.toHaveBeenCalledWith(
      expect.objectContaining({
        method: "updateRuleSets",
      })
    );
  });

  it("getMatchedRule calls service", async () => {
    const matchedRules = [{ ruleSetName: "Test", ruleName: "Rule 1" }];
    mockSendMessage.mockImplementation(async (request) => {
      if (request.method === "getMatchedRules") {
        return { type: "response", success: true, result: matchedRules };
      }
      if (request.method === "isEnabled") {
        return { type: "response", success: true, result: false };
      }
      if (request.method === "getRuleSets") {
        return { type: "response", success: true, result: [] };
      }
      if (request.method === "getLanguage") {
        return { type: "response", success: true, result: "en" };
      }
      return { type: "response", success: true, result: null };
    });

    const { result } = renderHook(() => useRequestBlockClient());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    let matched;
    await act(async () => {
      matched = await result.current.getMatchedRule();
    });

    expect(matched).toStrictEqual(matchedRules);
  });

  it("setLanguage updates language and calls service", async () => {
    const { result } = renderHook(() => useRequestBlockClient());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    await act(async () => {
      await result.current.setLanguage("ja");
    });

    expect(result.current.language).toBe("ja");
    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "request",
        method: "setLanguage",
        args: ["ja"],
      })
    );
  });

  it("performExport calls service and returns exported data", async () => {
    const exportedData = { version: 1, ruleSets: [{ name: "Export Set" }] };
    mockSendMessage.mockImplementation(async (request) => {
      if (request.method === "export") {
        return { type: "response", success: true, result: exportedData };
      }
      if (request.method === "isEnabled") {
        return { type: "response", success: true, result: false };
      }
      if (request.method === "getRuleSets") {
        return { type: "response", success: true, result: [] };
      }
      if (request.method === "getLanguage") {
        return { type: "response", success: true, result: "en" };
      }
      return { type: "response", success: true, result: null };
    });

    const { result } = renderHook(() => useRequestBlockClient());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    let exported;
    await act(async () => {
      exported = await result.current.performExport();
    });

    expect(exported).toStrictEqual(exportedData);
  });

  it("performImport calls service and returns result", async () => {
    const importResult: [boolean, []] = [true, []];
    mockSendMessage.mockImplementation(async (request) => {
      if (request.method === "import") {
        return { type: "response", success: true, result: importResult };
      }
      if (request.method === "isEnabled") {
        return { type: "response", success: true, result: false };
      }
      if (request.method === "getRuleSets") {
        return { type: "response", success: true, result: [] };
      }
      if (request.method === "getLanguage") {
        return { type: "response", success: true, result: "en" };
      }
      return { type: "response", success: true, result: null };
    });

    const { result } = renderHook(() => useRequestBlockClient());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    let imported;
    await act(async () => {
      imported = await result.current.performImport({ version: 1, ruleSets: [] });
    });

    expect(imported).toStrictEqual(importResult);
  });

  it("cleans up event listeners on unmount", async () => {
    const { result, unmount } = renderHook(() => useRequestBlockClient());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    unmount();

    expect(mockRemoveListener).toHaveBeenCalled();
  });
});
