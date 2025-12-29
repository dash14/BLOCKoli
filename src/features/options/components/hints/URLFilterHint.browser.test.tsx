import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { renderWithChakra } from "@/test/utils/render";
import { URLFilterHint } from "./URLFilterHint";

describe("URLFilterHint component", () => {
  test("renders hint content when opened", async () => {
    await renderWithChakra(<URLFilterHint />);
    const button = page.getByRole("button", { name: "hint" });
    await button.click();

    const dialog = page.getByRole("dialog");
    await expect.element(dialog).toBeInTheDocument();
    await expect(dialog).toMatchScreenshot("URLFilterHint-open");
  });
});
