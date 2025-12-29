import { describe, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { renderWithChakra } from "@/test/utils/render";
import { RemoveButton } from "./RemoveButton";

describe("RemoveButton component", () => {
  test("renders remove button", async () => {
    const onPerform = vi.fn();
    await renderWithChakra(
      <div data-testid="container">
        <RemoveButton onPerform={onPerform} />
      </div>
    );
    const button = page.getByRole("button", { name: "Remove" });
    await expect.element(button).toBeInTheDocument();

    const container = page.getByTestId("container");
    await expect(container).toMatchScreenshot("RemoveButton-default");
  });

  test("opens dialog when clicked", async () => {
    const onPerform = vi.fn();
    await renderWithChakra(
      <div data-testid="container">
        <RemoveButton title="Delete Item" onPerform={onPerform} />
      </div>
    );
    const button = page.getByRole("button", { name: "Remove" });
    await button.click();

    // Verify dialog is opened
    await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();
    await expect.element(page.getByText("Delete Item")).toBeInTheDocument();
  });
});
