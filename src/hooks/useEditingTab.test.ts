import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import { useEditingTab } from "./useEditingTab";

// Stands for another options page
function otherPage() {
  const channel = new BroadcastChannel("options-editing-tab");
  const received = vi.fn();
  channel.onmessage = (event: MessageEvent) => received(event.data);
  onTestFinished(() => channel.close());
  return { channel, received };
}

describe("useEditingTab", () => {
  it("edits when opened and tells the other pages", async () => {
    const other = otherPage();
    const { result } = renderHook(() => useEditingTab());

    expect(result.current.editing).toBe(true);
    await waitFor(() => expect(other.received).toHaveBeenCalledWith("editing"));
  });

  it("stops editing when another page opens", async () => {
    const other = otherPage();
    const { result } = renderHook(() => useEditingTab());

    other.channel.postMessage("editing");

    await waitFor(() => expect(result.current.editing).toBe(false));
  });

  it("edits again here and tells the other pages", async () => {
    const other = otherPage();
    const { result } = renderHook(() => useEditingTab());
    other.channel.postMessage("editing");
    await waitFor(() => expect(result.current.editing).toBe(false));
    other.received.mockClear();

    act(() => {
      result.current.editHere();
    });

    expect(result.current.editing).toBe(true);
    await waitFor(() => expect(other.received).toHaveBeenCalledWith("editing"));
  });

  it("tells no page once unmounted", async () => {
    const other = otherPage();
    const { result, unmount } = renderHook(() => useEditingTab());
    await waitFor(() => expect(other.received).toHaveBeenCalledTimes(1));

    unmount();
    result.current.editHere();
    const later = otherPage();
    later.channel.postMessage("check");

    await waitFor(() => expect(other.received).toHaveBeenCalledWith("check"));
    expect(other.received).toHaveBeenCalledTimes(2);
  });
});
