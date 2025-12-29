import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithChakra } from "@/test/utils/render";
import { RuleMenu } from "./RuleMenu";

describe("RuleMenu component", () => {
  test("renders menu button", async () => {
    await renderWithChakra(
      <div data-testid="container">
        <RuleMenu onRemove={() => {}} />
      </div>
    );
    await expect
      .element(page.getByRole("button", { name: "more" }))
      .toBeInTheDocument();

    // reset hover/focus states before screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "RuleMenu-default"
    );
  });

  test("opens menu when clicked", async () => {
    await renderWithChakra(
      <div data-testid="container">
        <RuleMenu onRemove={() => {}} />
      </div>
    );
    await page.getByRole("button", { name: "more" }).click();
    await expect
      .element(page.getByRole("menuitem", { name: /remove/i }))
      .toBeInTheDocument();

    // reset hover/focus states before screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByRole("menu")).toMatchScreenshot("RuleMenu-open");
  });
});
