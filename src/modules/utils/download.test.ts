import { afterEach, describe, expect, it, vi } from "vitest";
import { download } from "./download";

describe("download", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("clicks a temporary link to the blob, then cleans up", () => {
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:test");
    const revokeObjectURL = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    const clicked: { download: string; href: string; attached: boolean }[] =
      [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
      function (this: HTMLAnchorElement) {
        clicked.push({
          download: this.download,
          href: this.href,
          attached: document.body.contains(this),
        });
      }
    );
    const blob = new Blob(["{}"], { type: "application/json" });

    download(blob, "BLOCKoli.json");

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(clicked).toEqual([
      { download: "BLOCKoli.json", href: "blob:test", attached: true },
    ]);
    expect(document.querySelector("a")).toBeNull();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:test");
  });
});
