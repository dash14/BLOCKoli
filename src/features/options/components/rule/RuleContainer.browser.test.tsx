import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { renderWithChakra } from "@/test/utils/render";
import { RuleContainer } from "./RuleContainer";

describe("RuleContainer component", () => {
  test("renders children", async () => {
    await renderWithChakra(
      <div data-testid="container">
        <RuleContainer>
          <span>Test Content</span>
        </RuleContainer>
      </div>
    );
    await expect.element(page.getByText("Test Content")).toBeInTheDocument();
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "RuleContainer-default"
    );
  });

  test("renders with editing border", async () => {
    await renderWithChakra(
      <div data-testid="container">
        <RuleContainer isEditing={true}>
          <span>Editing Content</span>
        </RuleContainer>
      </div>
    );
    await expect.element(page.getByText("Editing Content")).toBeInTheDocument();
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "RuleContainer-editing"
    );
  });
});
