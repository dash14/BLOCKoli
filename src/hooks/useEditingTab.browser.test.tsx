import { describe, expect, it, onTestFinished } from "vitest";
import { renderHook } from "vitest-browser-react";
import { EDITING_LOCK_NAME, useEditingTab } from "./useEditingTab";

// Stands for another options page opening, which takes the lock from this one
function openOtherPage() {
  let close = () => {};
  const closed = new Promise<void>((resolve) => (close = resolve));
  const held = navigator.locks
    .request(EDITING_LOCK_NAME, { steal: true }, () => closed)
    .catch(() => "taken back");
  onTestFinished(close);
  return { close, held };
}

async function holders() {
  const { held = [] } = await navigator.locks.query();
  return held.filter((lock) => lock.name === EDITING_LOCK_NAME).length;
}

describe("useEditingTab", () => {
  it("edits when opened", async () => {
    const { result } = await renderHook(() => useEditingTab());

    expect(result.current.editing).toBe(true);
    await expect.poll(holders).toBe(1);
  });

  it("stops editing when another page opens, and edits again once it closes", async () => {
    const { result } = await renderHook(() => useEditingTab());
    await expect.poll(holders).toBe(1);

    const other = openOtherPage();
    await expect.poll(() => result.current.editing).toBe(false);

    other.close();
    await expect.poll(() => result.current.editing).toBe(true);
  });

  it("takes editing back from the other page", async () => {
    const { result, act } = await renderHook(() => useEditingTab());
    await expect.poll(holders).toBe(1);
    const other = openOtherPage();
    await expect.poll(() => result.current.editing).toBe(false);

    await act(() => result.current.editHere());

    await expect.poll(() => result.current.editing).toBe(true);
    expect(await other.held).toBe("taken back");
  });

  it("lets only the page opened last edit when two open together", async () => {
    const first = await renderHook(() => useEditingTab());
    const second = await renderHook(() => useEditingTab());

    await expect.poll(() => first.result.current.editing).toBe(false);
    expect(second.result.current.editing).toBe(true);
  });

  it("lets a waiting page edit once the editing one is unmounted", async () => {
    const first = await renderHook(() => useEditingTab());
    await expect.poll(holders).toBe(1);
    const second = await renderHook(() => useEditingTab());
    await expect.poll(() => first.result.current.editing).toBe(false);

    await second.unmount();

    await expect.poll(() => first.result.current.editing).toBe(true);
  });

  it("releases the lock when unmounted before it is granted", async () => {
    const other = openOtherPage();
    const { unmount } = await renderHook(() => useEditingTab());
    await unmount();
    other.close();
    await other.held;

    await expect.poll(holders).toBe(0);
  });
});
