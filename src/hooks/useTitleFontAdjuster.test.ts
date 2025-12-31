import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTitleFontAdjuster } from "./useTitleFontAdjuster";

describe("useTitleFontAdjuster", () => {
  it("returns -1 for Japanese language", () => {
    const { result } = renderHook(() => useTitleFontAdjuster("ja"));
    expect(result.current.titleFontAdjuster).toBe(-1);
  });

  it("returns 0 for English language", () => {
    const { result } = renderHook(() => useTitleFontAdjuster("en"));
    expect(result.current.titleFontAdjuster).toBe(0);
  });

  it("returns 0 for other languages", () => {
    const { result } = renderHook(() => useTitleFontAdjuster("fr"));
    expect(result.current.titleFontAdjuster).toBe(0);
  });

  it("returns 0 for empty string", () => {
    const { result } = renderHook(() => useTitleFontAdjuster(""));
    expect(result.current.titleFontAdjuster).toBe(0);
  });

  it("updates when language changes from en to ja", () => {
    const { result, rerender } = renderHook(
      ({ language }) => useTitleFontAdjuster(language),
      { initialProps: { language: "en" } }
    );

    expect(result.current.titleFontAdjuster).toBe(0);

    rerender({ language: "ja" });
    expect(result.current.titleFontAdjuster).toBe(-1);
  });

  it("updates when language changes from ja to en", () => {
    const { result, rerender } = renderHook(
      ({ language }) => useTitleFontAdjuster(language),
      { initialProps: { language: "ja" } }
    );

    expect(result.current.titleFontAdjuster).toBe(-1);

    rerender({ language: "en" });
    expect(result.current.titleFontAdjuster).toBe(0);
  });
});
