import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithChakra } from "@/test/utils/render";
import { ConfigureRulesLink } from "./ConfigureRulesLink";

describe("ConfigureRulesLink component", () => {
  test("renders link with icons", async () => {
    await renderWithChakra(
      <div data-testid="container">
        <ConfigureRulesLink optionsUrl="chrome://extensions" />
      </div>
    );
    await expect
      .element(page.getByRole("link", { name: /configure rules/i }))
      .toBeInTheDocument();

    // reset hover/focus states before screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "ConfigureRulesLink-default"
    );
  });
});
