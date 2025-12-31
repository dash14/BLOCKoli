import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useArrayKey } from "./useArrayKey";

describe("useArrayKey", () => {
  it("initializes with correct length after effect", async () => {
    const { result } = renderHook(() => useArrayKey(3));

    expect(result.current.elementKeys).toHaveLength(3);
    const uniqueKeys = new Set(result.current.elementKeys);
    expect(uniqueKeys.size).toBe(3);
  });

  it("initializes with zero length", () => {
    const { result } = renderHook(() => useArrayKey(0));

    expect(result.current.elementKeys).toHaveLength(0);
  });

  it("pushElementKey adds a new unique key", () => {
    const { result } = renderHook(() => useArrayKey(2));

    const initialKeys = [...result.current.elementKeys];
    expect(initialKeys).toHaveLength(2);

    act(() => {
      result.current.pushElementKey();
    });

    expect(result.current.elementKeys).toHaveLength(3);
    const newKey = result.current.elementKeys[2];
    expect(initialKeys).not.toContain(newKey);
  });

  it("removeElementKeyAt removes key at specified index", () => {
    const { result } = renderHook(() => useArrayKey(3));

    const initialKeys = [...result.current.elementKeys];
    const keyToRemove = initialKeys[1];

    act(() => {
      result.current.removeElementKeyAt(1);
    });

    expect(result.current.elementKeys).toHaveLength(2);
    expect(result.current.elementKeys).not.toContain(keyToRemove);
    expect(result.current.elementKeys[0]).toBe(initialKeys[0]);
    expect(result.current.elementKeys[1]).toBe(initialKeys[2]);
  });

  it("removeElementKeyAt removes first element", () => {
    const { result } = renderHook(() => useArrayKey(3));

    const initialKeys = [...result.current.elementKeys];

    act(() => {
      result.current.removeElementKeyAt(0);
    });

    expect(result.current.elementKeys).toHaveLength(2);
    expect(result.current.elementKeys[0]).toBe(initialKeys[1]);
    expect(result.current.elementKeys[1]).toBe(initialKeys[2]);
  });

  it("removeElementKeyAt removes last element", () => {
    const { result } = renderHook(() => useArrayKey(3));

    const initialKeys = [...result.current.elementKeys];

    act(() => {
      result.current.removeElementKeyAt(2);
    });

    expect(result.current.elementKeys).toHaveLength(2);
    expect(result.current.elementKeys[0]).toBe(initialKeys[0]);
    expect(result.current.elementKeys[1]).toBe(initialKeys[1]);
  });

  it("resetElementLength resets to new length with new keys", () => {
    const { result } = renderHook(() => useArrayKey(2));

    const initialKeys = [...result.current.elementKeys];

    act(() => {
      result.current.resetElementLength(4);
    });

    expect(result.current.elementKeys).toHaveLength(4);
    const allUnique = new Set(result.current.elementKeys);
    expect(allUnique.size).toBe(4);
    initialKeys.forEach((key) => {
      expect(result.current.elementKeys).not.toContain(key);
    });
  });

  it("resetElementLength to zero", () => {
    const { result } = renderHook(() => useArrayKey(3));

    act(() => {
      result.current.resetElementLength(0);
    });

    expect(result.current.elementKeys).toHaveLength(0);
  });

  it("keys are always unique even after multiple operations", () => {
    const { result } = renderHook(() => useArrayKey(1));

    const allSeenKeys = new Set<number>();
    allSeenKeys.add(result.current.elementKeys[0]);

    for (let i = 0; i < 5; i++) {
      act(() => {
        result.current.pushElementKey();
      });
      const newKey = result.current.elementKeys[result.current.elementKeys.length - 1];
      expect(allSeenKeys.has(newKey)).toBe(false);
      allSeenKeys.add(newKey);
    }

    act(() => {
      result.current.resetElementLength(3);
    });

    result.current.elementKeys.forEach((key) => {
      expect(allSeenKeys.has(key)).toBe(false);
    });
  });
});
