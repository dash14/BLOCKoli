import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { renderWithChakra } from "@/test/utils/render";
import { RequestMethodsHint } from "./RequestMethodsHint";

describe("RequestMethodsHint component", () => {
  test("renders hint content when opened", async () => {
    await renderWithChakra(<RequestMethodsHint />);
    const button = page.getByRole("button", { name: "hint" });
    await button.click();

    const dialog = page.getByRole("dialog");
    await expect.element(dialog).toBeInTheDocument();
    await expect(dialog).toMatchScreenshot("RequestMethodsHint-open");
  });
});
