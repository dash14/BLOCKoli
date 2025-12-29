import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { renderWithChakra } from "@/test/utils/render";
import { NoRules } from "./NoRules";

describe("NoRules component", () => {
  test("renders message and link", async () => {
    await renderWithChakra(
      <div data-testid="container">
        <NoRules optionsUrl="chrome://extensions" />
      </div>
    );
    await expect
      .element(page.getByText(/no rules are defined/i))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("link", { name: /configure rules/i }))
      .toBeInTheDocument();
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "NoRules-default"
    );
  });
});
