import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { renderWithChakra } from "@/test/utils/render";
import { URLFilterWithRegexHint } from "./URLFilterWithRegexHint";

describe("URLFilterWithRegexHint component", () => {
  test("renders hint content when opened", async () => {
    await renderWithChakra(<URLFilterWithRegexHint />);
    const button = page.getByRole("button", { name: "hint" });
    await button.click();

    const dialog = page.getByRole("dialog");
    await expect.element(dialog).toBeInTheDocument();
    await expect(dialog).toMatchScreenshot("URLFilterWithRegexHint-open");
  });
});
