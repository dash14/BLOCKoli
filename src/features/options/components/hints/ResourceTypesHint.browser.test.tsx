import { beforeAll, describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { renderWithChakra } from "@/test/utils/render";
import { ResourceTypesHint } from "./ResourceTypesHint";

describe("ResourceTypesHint component", () => {
  beforeAll(async () => {
    await page.viewport(800, 900);
  });

  test("renders hint content when opened", async () => {
    await renderWithChakra(<ResourceTypesHint />);
    const button = page.getByRole("button", { name: "hint" });
    await button.click();

    const dialog = page.getByRole("dialog");
    await expect.element(dialog).toBeInTheDocument();
    await expect(dialog).toMatchScreenshot("ResourceTypesHint-open");
  });
});
