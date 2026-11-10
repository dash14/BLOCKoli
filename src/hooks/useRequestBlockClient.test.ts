import { StrictMode } from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, onTestFinished } from "vitest";
import { Rule, RuleActionType } from "@/modules/core/rules";
import { SaveConflictError } from "@/modules/rules/conflict";
import { StoredRuleSets } from "@/modules/rules/stored";
import { ErrorCode } from "@/modules/services/RequestBlockService";
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
    // Saves answer with revisions above any a test broadcasts
    let revision = 100;
    // Default mock responses
    mockSendMessage.mockImplementation(async (request) => {
      if (request.method === "isEnabled") {
        return { type: "response", success: true, result: false };
      }
      if (request.method === "getRuleSets") {
        return { type: "response", success: true, result: { revision: 0, ruleSets: [] } };
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
        return {
          type: "response",
          success: true,
          result: { revision: ++revision, ruleSets: request.args[0] },
        };
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
          result: { revision: 1, ruleSets: [{ name: "Test Set", rules: [] }] },
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
      new Error("storage error")
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

  it("updateRuleSets sends the change applied to the stored rule sets", async () => {
    const { result } = renderHook(() => useRequestBlockClient());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    const newRuleSets = [{ id: "rs-new", name: "New Set", rules: [] }];
    const change = vi.fn(() => newRuleSets);

    await act(async () => {
      await result.current.updateRuleSets(change);
    });

    expect(change).toHaveBeenCalledWith([]);
    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "request",
        method: "updateRuleSets",
        // Based on the revision loaded
        args: [newRuleSets, 0],
      })
    );
  });

  it("updateRuleSets does not call service when the change leaves them as they are", async () => {
    const { result } = renderHook(() => useRequestBlockClient());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    mockSendMessage.mockClear();

    let saved: StoredRuleSets | undefined;
    await act(async () => {
      saved = await result.current.updateRuleSets(() => []);
    });

    expect(saved).toStrictEqual([]);
    expect(mockSendMessage).not.toHaveBeenCalledWith(
      expect.objectContaining({
        method: "updateRuleSets",
      })
    );
  });

  it("updateRuleSets keeps and resolves to the rule sets returned by the service", async () => {
    const { result } = renderHook(() => useRequestBlockClient());

    await waitFor(() => {
      expect(result.current.loaded).toBe(true);
    });

    const unsaved: StoredRuleSets = [
      { id: "rs-1", name: "Set", rules: [{ id: 0, ...rule }] },
    ];
    const stored: StoredRuleSets = [
      { id: "rs-1", name: "Set", rules: [{ id: 5, ...rule }] },
    ];
    mockSendMessage.mockImplementation(async (request) => {
      if (request.method === "updateRuleSets") {
        return {
          type: "response",
          success: true,
          result: { revision: 1, ruleSets: stored },
        };
      }
      return { type: "response", success: true, result: null };
    });

    let saved: StoredRuleSets | undefined;
    await act(async () => {
      saved = await result.current.updateRuleSets(() => unsaved);
    });

    expect(saved).toStrictEqual(stored);
    expect(result.current.ruleSets).toStrictEqual(stored);
  });

  it("updateRuleSets applies a change to the latest state, not a stale render's", async () => {
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
    const fromAnotherPage = [{ id: "rs-1", name: "From another page", rules: [] }];

    act(() => {
      capturedListener(
        {
          type: "broadcast",
          service: "RequestBlock",
          event: "updateRuleSets",
          message: { revision: 1, ruleSets: fromAnotherPage },
        },
        {},
        vi.fn()
      );
    });

    const change = vi.fn(() => []);
    await act(async () => {
      await updateRuleSets(change);
    });

    expect(change).toHaveBeenCalledWith(fromAnotherPage);
    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ method: "updateRuleSets", args: [[], 1] })
    );
    expect(result.current.ruleSets).toStrictEqual([]);
  });

  describe("one save at a time", () => {
    const named = (name: string): StoredRuleSets => [
      { id: "rs-3", name, rules: [{ id: 1, ...rule }] },
    ];
    const versioned = (revision: number, name: string) => ({
      revision,
      ruleSets: named(name),
    });

    // Holds each updateRuleSets request until the test answers it
    const holdSaves = () => {
      const answers: ((response: unknown) => void)[] = [];
      const defaultImpl = mockSendMessage.getMockImplementation()!;
      mockSendMessage.mockImplementation(async (request) =>
        request.method === "updateRuleSets"
          ? new Promise((resolve) => answers.push(resolve))
          : defaultImpl(request)
      );
      return {
        get count() {
          return answers.length;
        },
        succeed: (index: number, result: unknown) =>
          act(async () => answers[index]({ type: "response", success: true, result })),
        fail: (index: number) =>
          act(async () =>
            answers[index]({ type: "response", success: false, error: "save failed" })
          ),
      };
    };

    const render = async () => {
      const hook = renderHook(() => useRequestBlockClient());
      await waitFor(() => expect(hook.result.current.loaded).toBe(true));
      const listener = mockAddListener.mock.lastCall![0];
      const broadcast = (message: unknown) =>
        act(() =>
          listener(
            { type: "broadcast", service: "RequestBlock", event: "updateRuleSets", message },
            {},
            vi.fn()
          )
        );
      return { result: hook.result, broadcast };
    };

    it("starts a change once the save before it is done, on what that save stored", async () => {
      const { result } = await render();
      const saves = holdSaves();

      const second = vi.fn(() => named("second"));
      let firstSave!: Promise<StoredRuleSets>, secondSave!: Promise<StoredRuleSets>;
      await act(async () => {
        firstSave = result.current.updateRuleSets(() => named("first"));
        secondSave = result.current.updateRuleSets(second);
      });
      expect(saves.count).toBe(1);
      expect(second).not.toHaveBeenCalled();

      await saves.succeed(0, versioned(1, "first"));
      await firstSave;
      expect(second).toHaveBeenCalledWith(named("first"));
      expect(result.current.ruleSets).toStrictEqual(named("first"));

      await saves.succeed(1, versioned(2, "second"));
      await secondSave;
      expect(result.current.ruleSets).toStrictEqual(named("second"));
    });

    it("hands the stored rule sets to onSaved before they render", async () => {
      const { result } = await render();
      const saves = holdSaves();

      const shownWhenSaved: StoredRuleSets[] = [];
      const onSaved = vi.fn(() => {
        shownWhenSaved.push(result.current.ruleSets);
      });
      let save!: Promise<StoredRuleSets>;
      await act(async () => {
        save = result.current.updateRuleSets(() => named("mine"), onSaved);
      });
      await saves.succeed(0, versioned(1, "mine"));
      await save;

      expect(onSaved).toHaveBeenCalledWith(named("mine"));
      expect(shownWhenSaved).toStrictEqual([[]]);
      expect(result.current.ruleSets).toStrictEqual(named("mine"));
    });

    it("hands the stored rule sets to onSaved when the change leaves them as they are", async () => {
      const { result } = await render();

      const onSaved = vi.fn();
      await act(async () => {
        await result.current.updateRuleSets((stored) => stored, onSaved);
      });

      expect(onSaved).toHaveBeenCalledWith([]);
    });

    it("holds broadcasts during a save, then applies the newest after its response", async () => {
      const { result, broadcast } = await render();
      const saves = holdSaves();

      let save!: Promise<StoredRuleSets>;
      await act(async () => {
        save = result.current.updateRuleSets(() => named("mine"));
      });
      broadcast(versioned(1, "mine"));
      broadcast(versioned(3, "imported after mine"));
      broadcast(versioned(2, "older"));
      expect(result.current.ruleSets).toStrictEqual([]);

      await saves.succeed(0, versioned(1, "mine"));
      expect(await save).toStrictEqual(named("mine"));
      expect(result.current.ruleSets).toStrictEqual(named("imported after mine"));
    });

    it("rejects a change whose save fails, and applies the next one to the state before it", async () => {
      const { result, broadcast } = await render();
      const saves = holdSaves();

      const next = vi.fn(() => named("next"));
      let failed!: Promise<StoredRuleSets>;
      await act(async () => {
        failed = result.current.updateRuleSets(() => named("failed"));
        void result.current.updateRuleSets(next);
      });
      const rejected = expect(failed).rejects.toThrow(new Error("save failed"));
      broadcast(versioned(1, "imported meanwhile"));
      await saves.fail(0);
      await rejected;

      expect(result.current.ruleSets).toStrictEqual(named("imported meanwhile"));
      expect(next).toHaveBeenCalledWith(named("imported meanwhile"));
    });

    it("keeps the state when the only save fails", async () => {
      const { result } = await render();
      const saves = holdSaves();

      let save!: Promise<StoredRuleSets>;
      await act(async () => {
        save = result.current.updateRuleSets(() => named("failed"));
      });
      const failed = expect(save).rejects.toThrow(new Error("save failed"));
      await saves.fail(0);
      await failed;

      expect(result.current.ruleSets).toStrictEqual([]);
    });

    it("ignores a broadcast older than what is shown", async () => {
      const { result, broadcast } = await render();

      broadcast(versioned(3, "newer"));
      broadcast(versioned(2, "older"));

      expect(result.current.ruleSets).toStrictEqual(named("newer"));
    });
  });

  describe("saving after another page saved", () => {
    const named = (name: string): StoredRuleSets => [
      { id: "rs-3", name, rules: [{ id: 1, ...rule }] },
    ];
    const stale = {
      type: "response",
      success: false,
      error: "The rule sets were changed in another tab",
      code: ErrorCode.STALE_RULE_SETS,
    };

    // The service holds rule sets saved by another page that this one has not received yet
    const storedElsewhere = (staleSaves: number) => {
      const defaultImpl = mockSendMessage.getMockImplementation()!;
      let rejected = 0;
      mockSendMessage.mockImplementation(async (request) => {
        if (request.method === "getRuleSets") {
          return {
            type: "response",
            success: true,
            result: { revision: 5, ruleSets: named("elsewhere") },
          };
        }
        if (request.method === "updateRuleSets" && rejected++ < staleSaves) {
          return stale;
        }
        return defaultImpl(request);
      });
    };
    const sentRevisions = () =>
      mockSendMessage.mock.calls
        .map(([request]) => request)
        .filter((request) => request.method === "updateRuleSets")
        .map((request) => request.args[1]);

    const render = async () => {
      const hook = renderHook(() => useRequestBlockClient());
      await waitFor(() => expect(hook.result.current.loaded).toBe(true));
      return hook.result;
    };

    it("applies the change again to the stored rule sets and saves on their revision", async () => {
      const result = await render();
      storedElsewhere(1);

      const mine = { id: "rs-mine", name: "mine", rules: [] };
      const change = vi.fn((stored: StoredRuleSets) => [...stored, mine]);
      let saved: StoredRuleSets | undefined;
      await act(async () => {
        saved = await result.current.updateRuleSets(change);
      });

      expect(change.mock.calls).toEqual([[[]], [named("elsewhere")]]);
      expect(sentRevisions()).toEqual([0, 5]);
      expect(saved).toStrictEqual([...named("elsewhere"), mine]);
      expect(result.current.ruleSets).toStrictEqual([...named("elsewhere"), mine]);
    });

    it("does not save when the change no longer changes the stored rule sets", async () => {
      const result = await render();
      storedElsewhere(1);

      let saved: StoredRuleSets | undefined;
      await act(async () => {
        saved = await result.current.updateRuleSets((stored) =>
          stored.length === 0 ? named("elsewhere") : stored
        );
      });

      expect(sentRevisions()).toEqual([0]);
      expect(saved).toStrictEqual(named("elsewhere"));
    });

    it("reports a conflict after three saves in a row are refused", async () => {
      const result = await render();
      storedElsewhere(3);

      let failed!: Promise<StoredRuleSets>;
      await act(async () => {
        failed = result.current.updateRuleSets((stored) => [
          ...stored,
          ...named("mine"),
        ]);
        await failed.catch(() => {});
      });

      await expect(failed).rejects.toBeInstanceOf(SaveConflictError);
      expect(sentRevisions()).toEqual([0, 5, 5]);
      expect(result.current.ruleSets).toStrictEqual(named("elsewhere"));
    });

    it("passes on any other rejection without trying again", async () => {
      const result = await render();
      const defaultImpl = mockSendMessage.getMockImplementation()!;
      mockSendMessage.mockImplementation(async (request) =>
        request.method === "updateRuleSets"
          ? {
              type: "response",
              success: false,
              error: "There would be 501 rules, but at most 500 can be defined.",
              code: ErrorCode.TOO_MANY_RULES,
              params: { count: 501, max: 500 },
            }
          : defaultImpl(request)
      );

      let failed!: Promise<StoredRuleSets>;
      await act(async () => {
        failed = result.current.updateRuleSets(() => named("mine"));
        await failed.catch(() => {});
      });

      await expect(failed).rejects.toMatchObject({
        name: "ServiceError",
        code: ErrorCode.TOO_MANY_RULES,
        params: { count: 501, max: 500 },
      });
      expect(sentRevisions()).toEqual([0]);
    });

    it("rejects without saving when the change finds a conflict", async () => {
      const result = await render();
      storedElsewhere(1);
      const conflict = new Error("conflict");

      let failed!: Promise<StoredRuleSets>;
      await act(async () => {
        failed = result.current.updateRuleSets((stored) => {
          if (stored.length > 0) throw conflict;
          return named("mine");
        });
        await failed.catch(() => {});
      });

      await expect(failed).rejects.toBe(conflict);
      expect(sentRevisions()).toEqual([0]);
      expect(result.current.ruleSets).toStrictEqual(named("elsewhere"));
    });
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
        return { type: "response", success: true, result: { revision: 0, ruleSets: [] } };
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
        return { type: "response", success: true, result: { revision: 0, ruleSets: [] } };
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
        return { type: "response", success: true, result: { revision: 0, ruleSets: [] } };
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
          message: { revision: 1, ruleSets },
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
    // Holds the getLanguage response, the last call of the load, until the test releases it.
    function holdInitialLoad(languageResponse: object) {
      let release!: () => void;
      const held = new Promise<void>((resolve) => (release = resolve));
      const defaultImpl = mockSendMessage.getMockImplementation()!;
      mockSendMessage.mockImplementation(async (request) => {
        if (request.method === "getRuleSets") {
          return {
            type: "response",
            success: true,
            result: { revision: 1, ruleSets: [{ name: "Stale Set", rules: [] }] },
          };
        }
        if (request.method === "getLanguage") {
          await held;
          return languageResponse;
        }
        return defaultImpl(request);
      });
      return release;
    }

    async function waitForGetLanguage() {
      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith(
          expect.objectContaining({ method: "getLanguage" })
        );
      });
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

    const loadedEn = { type: "response", success: true, result: "en" };

    it("keeps broadcasts received during the load over the loaded values", async () => {
      const release = holdInitialLoad(loadedEn);
      const { result } = renderHook(() => useRequestBlockClient());
      await waitForGetLanguage();

      const fresh = [{ name: "Fresh Set", rules: [] }];
      broadcast("changeState", "enable");
      broadcast("updateRuleSets", { revision: 2, ruleSets: fresh });

      await act(async () => release());
      await waitFor(() => {
        expect(result.current.loaded).toBe(true);
      });

      expect(result.current.enabled).toBe(true);
      expect(result.current.ruleSets).toStrictEqual(fresh);
    });

    it("keeps a language picked during the load over the loaded one", async () => {
      const release = holdInitialLoad(loadedEn);
      const { result } = renderHook(() => useRequestBlockClient());
      await waitForGetLanguage();

      await act(async () => {
        await result.current.setLanguage("ja");
      });

      await act(async () => release());
      await waitFor(() => {
        expect(result.current.loaded).toBe(true);
      });

      expect(result.current.language).toBe("ja");
      expect(updateI18nLanguage).not.toHaveBeenCalledWith("en");
    });

    it("does not apply a load that finishes after unmount", async () => {
      const release = holdInitialLoad(loadedEn);
      const { unmount } = renderHook(() => useRequestBlockClient());
      await waitForGetLanguage();

      unmount();
      await act(async () => release());

      expect(updateI18nLanguage).not.toHaveBeenCalled();
    });

    it("does not report a load that fails after unmount", async () => {
      const logError = vi.spyOn(logging.getLogger("client"), "error");
      onTestFinished(() => logError.mockRestore());
      const release = holdInitialLoad({
        type: "response",
        success: false,
        error: "storage error",
      });
      const { unmount } = renderHook(() => useRequestBlockClient());
      await waitForGetLanguage();

      unmount();
      await act(async () => release());

      expect(logError).not.toHaveBeenCalled();
    });
  });
});
