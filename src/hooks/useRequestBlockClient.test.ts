import { StrictMode } from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, onTestFinished } from "vitest";
import { Rule, RuleActionType } from "@/modules/core/rules";
import { StoredRuleSets } from "@/modules/rules/stored";
import logging from "@/modules/utils/logging";
import { updateI18nLanguage } from "./useI18n";
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

const rule: Rule = {
  action: { type: RuleActionType.BLOCK },
  condition: { requestDomains: ["example.com"] },
};

describe("useRequestBlockClient", () => {
  beforeEach(() => {
    vi.resetAllMocks();
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
        return { type: "response", success: true, result: request.args[0] };
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
    expect(result.current.loadFailed).toBe(false);
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
    expect(result.current.loadFailed).toBe(false);
  });

  it("reports a failed initial load instead of staying in loading", async () => {
    const logError = vi
      .spyOn(logging.getLogger("client"), "error")
      .mockImplementation(() => {});
    onTestFinished(() => logError.mockRestore());
    mockSendMessage.mockImplementation(async (request) => {
      if (request.method === "isEnabled") {
        return { type: "response", success: true, result: true };
      }
      return { type: "response", success: false, error: "storage error" };
    });

    const { result } = renderHook(() => useRequestBlockClient());

    await waitFor(() => {
      expect(result.current.loadFailed).toBe(true);
    });

    expect(result.current.loaded).toBe(false);
    // isEnabled succeeded, but a failed load applies none of the results
    expect(result.current.enabled).toBe(false);
    expect(logError).toHaveBeenCalledWith(
      "failed to load the initial state",
      "storage error"
    );
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

  it("updateRuleSets keeps the rule sets returned by the service", async () => {
    const { result } = renderHook(() => useRequestBlockClient());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    const unsaved: StoredRuleSets = [{ name: "Set", rules: [{ id: 0, ...rule }] }];
    const saved: StoredRuleSets = [{ name: "Set", rules: [{ id: 5, ...rule }] }];
    mockSendMessage.mockImplementation(async (request) => {
      if (request.method === "updateRuleSets") {
        return { type: "response", success: true, result: saved };
      }
      return { type: "response", success: true, result: null };
    });

    await act(async () => {
      await result.current.updateRuleSets(unsaved);
    });

    expect(result.current.ruleSets).toStrictEqual(saved);
  });

  it("updateRuleSets compares with the latest state, not a stale render's", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedListener: any;
    mockAddListener.mockImplementation((listener) => {
      capturedListener = listener;
    });

    const { result } = renderHook(() => useRequestBlockClient());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    // Captured while the state is still []
    const updateRuleSets = result.current.updateRuleSets;

    act(() => {
      capturedListener(
        {
          type: "broadcast",
          service: "RequestBlock",
          event: "updateRuleSets",
          message: [{ name: "From another page", rules: [] }],
        },
        {},
        vi.fn()
      );
    });

    await act(async () => {
      await updateRuleSets([]);
    });

    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ method: "updateRuleSets", args: [[]] })
    );
    expect(result.current.ruleSets).toStrictEqual([]);
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

  it("keeps a single message listener across re-renders", async () => {
    const { result, rerender, unmount } = renderHook(() =>
      useRequestBlockClient()
    );

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });
    rerender();
    rerender();

    expect(mockAddListener).toHaveBeenCalledTimes(1);
    const listener = mockAddListener.mock.calls[0][0];

    unmount();

    expect(mockRemoveListener).toHaveBeenCalledTimes(1);
    expect(mockRemoveListener).toHaveBeenCalledWith(listener);
  });

  it("keeps one message listener when StrictMode re-runs the effect", async () => {
    const { result, unmount } = renderHook(() => useRequestBlockClient(), {
      wrapper: StrictMode,
    });

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    const added = mockAddListener.mock.calls.map(([listener]) => listener);
    const removed = mockRemoveListener.mock.calls.map(([listener]) => listener);
    expect(added.filter((listener) => !removed.includes(listener))).toHaveLength(1);

    unmount();

    const removedAfter = mockRemoveListener.mock.calls.map(([listener]) => listener);
    expect(added.filter((listener) => !removedAfter.includes(listener))).toHaveLength(0);
  });

  it("updates rule sets when updateRuleSets event is received", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedListener: any;
    mockAddListener.mockImplementation((listener) => {
      capturedListener = listener;
    });

    const { result } = renderHook(() => useRequestBlockClient());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    const ruleSets = [{ name: "Broadcast Set", rules: [] }];
    act(() => {
      capturedListener(
        {
          type: "broadcast",
          service: "RequestBlock",
          event: "updateRuleSets",
          message: ruleSets,
        },
        {},
        vi.fn()
      );
    });

    expect(result.current.ruleSets).toStrictEqual(ruleSets);
  });

  it("updates enabled state when changeState event is received", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedListener: any;
    mockAddListener.mockImplementation((listener) => {
      capturedListener = listener;
    });

    const { result } = renderHook(() => useRequestBlockClient());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    // Initially disabled
    expect(result.current.enabled).toBe(false);

    // Simulate receiving "changeState" event with "enable"
    act(() => {
      capturedListener(
        {
          type: "broadcast",
          service: "RequestBlock",
          event: "changeState",
          message: "enable",
        },
        {},
        vi.fn()
      );
    });

    expect(result.current.enabled).toBe(true);
  });

  describe("initial load ordering", () => {
    // Holds the isEnabled response until the test releases it.
    function holdInitialLoad(response: object) {
      let release!: () => void;
      const held = new Promise<void>((resolve) => (release = resolve));
      const defaultImpl = mockSendMessage.getMockImplementation()!;
      mockSendMessage.mockImplementation(async (request) => {
        if (request.method === "isEnabled") {
          await held;
          return response;
        }
        if (request.method === "getRuleSets") {
          return {
            type: "response",
            success: true,
            result: [{ name: "Stale Set", rules: [] }],
          };
        }
        return defaultImpl(request);
      });
      return release;
    }

    function broadcast(event: string, message: unknown) {
      const listener = mockAddListener.mock.lastCall![0];
      act(() => {
        listener(
          { type: "broadcast", service: "RequestBlock", event, message },
          {},
          vi.fn()
        );
      });
    }

    it("keeps broadcasts received during the load over the loaded values", async () => {
      const release = holdInitialLoad({
        type: "response",
        success: true,
        result: false,
      });
      const { result } = renderHook(() => useRequestBlockClient());

      const fresh = [{ name: "Fresh Set", rules: [] }];
      broadcast("changeState", "enable");
      broadcast("updateRuleSets", fresh);

      await act(async () => release());
      await waitFor(() => {
        expect(result.current.loaded).toBe(true);
      });

      expect(result.current.enabled).toBe(true);
      expect(result.current.ruleSets).toStrictEqual(fresh);
    });

    it("does not apply a load that finishes after unmount", async () => {
      const release = holdInitialLoad({
        type: "response",
        success: true,
        result: true,
      });
      const { result, unmount } = renderHook(() => useRequestBlockClient());

      unmount();
      await act(async () => release());
      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith(
          expect.objectContaining({ method: "getLanguage" })
        );
      });
      await act(async () => {});

      expect(updateI18nLanguage).not.toHaveBeenCalled();
      expect(result.current.loaded).toBe(false);
      expect(result.current.enabled).toBe(false);
    });

    it("does not report a load that fails after unmount", async () => {
      const logError = vi.spyOn(logging.getLogger("client"), "error");
      onTestFinished(() => logError.mockRestore());
      const release = holdInitialLoad({
        type: "response",
        success: false,
        error: "storage error",
      });
      const { result, unmount } = renderHook(() => useRequestBlockClient());

      unmount();
      await act(async () => release());
      await act(async () => {});

      expect(logError).not.toHaveBeenCalled();
      expect(result.current.loadFailed).toBe(false);
    });
  });
});
