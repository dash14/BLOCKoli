import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDefer } from "./useDefer";

describe("useDefer", () => {
  it("returns promise and resolve functions", () => {
    const { result } = renderHook(() => useDefer<string>());

    expect(result.current.promise).toBeTypeOf("function");
    expect(result.current.resolve).toBeTypeOf("function");
  });

  it("promise resolves with the value passed to resolve", async () => {
    const { result } = renderHook(() => useDefer<string>());

    let promiseResult: string | undefined;

    act(() => {
      result.current.promise().then((value) => {
        promiseResult = value;
      });
    });

    act(() => {
      result.current.resolve("test value");
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(promiseResult).toBe("test value");
  });

  it("promise resolves with number value", async () => {
    const { result } = renderHook(() => useDefer<number>());

    let promiseResult: number | undefined;

    act(() => {
      result.current.promise().then((value) => {
        promiseResult = value;
      });
    });

    act(() => {
      result.current.resolve(42);
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(promiseResult).toBe(42);
  });

  it("promise resolves with object value", async () => {
    const { result } = renderHook(() => useDefer<{ name: string }>());

    let promiseResult: { name: string } | undefined;

    act(() => {
      result.current.promise().then((value) => {
        promiseResult = value;
      });
    });

    act(() => {
      result.current.resolve({ name: "test" });
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(promiseResult).toStrictEqual({ name: "test" });
  });

  it("resolve does nothing if promise was not called", () => {
    const { result } = renderHook(() => useDefer<string>());

    // Should not throw
    expect(() => {
      act(() => {
        result.current.resolve("value");
      });
    }).not.toThrow();
  });

  it("can create multiple promises sequentially", async () => {
    const { result } = renderHook(() => useDefer<string>());

    // First promise
    let firstResult: string | undefined;
    act(() => {
      result.current.promise().then((value) => {
        firstResult = value;
      });
    });

    act(() => {
      result.current.resolve("first");
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(firstResult).toBe("first");

    // Second promise
    let secondResult: string | undefined;
    act(() => {
      result.current.promise().then((value) => {
        secondResult = value;
      });
    });

    act(() => {
      result.current.resolve("second");
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(secondResult).toBe("second");
  });

  it("promise resolves with boolean value", async () => {
    const { result } = renderHook(() => useDefer<boolean>());

    let promiseResult: boolean | undefined;

    act(() => {
      result.current.promise().then((value) => {
        promiseResult = value;
      });
    });

    act(() => {
      result.current.resolve(true);
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(promiseResult).toBe(true);
  });
});
