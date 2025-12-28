import { describe, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { renderWithChakra } from "@/test/utils/render";
import { EditableTitle } from "./EditableTitle";

describe("EditableTitle component", () => {
  test("renders with default value", async () => {
    const onChange = vi.fn();
    await renderWithChakra(
      <div data-testid="container">
        <EditableTitle onChange={onChange} />
      </div>
    );
    await expect.element(page.getByText("RuleSet")).toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "Edit" }))
      .toBeInTheDocument();

    const container = page.getByTestId("container");
    await expect(container).toMatchScreenshot("EditableTitle-default");
  });

  test("renders with custom defaultValue", async () => {
    const onChange = vi.fn();
    await renderWithChakra(
      <div data-testid="container">
        <EditableTitle defaultValue="Custom Title" onChange={onChange} />
      </div>
    );
    await expect.element(page.getByText("Custom Title")).toBeInTheDocument();
  });

  test("enters edit mode when clicking edit button", async () => {
    const onChange = vi.fn();
    await renderWithChakra(
      <div data-testid="container">
        <EditableTitle onChange={onChange} />
      </div>
    );
    const editButton = page.getByRole("button", { name: "Edit" });
    await editButton.click();

    await expect
      .element(page.getByRole("button", { name: "Submit" }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "Cancel" }))
      .toBeInTheDocument();

    const container = page.getByTestId("container");
    await expect(container).toMatchScreenshot("EditableTitle-editing");
  });

  test("submits changes when clicking apply button", async () => {
    const onChange = vi.fn();
    await renderWithChakra(
      <div data-testid="container">
        <EditableTitle onChange={onChange} />
      </div>
    );
    const editButton = page.getByRole("button", { name: "Edit" });
    await editButton.click();

    const input = page.getByRole("textbox");
    await input.clear();
    await input.fill("New Title");

    const submitButton = page.getByRole("button", { name: "Submit" });
    await submitButton.click();

    await expect.element(page.getByText("New Title")).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith("New Title");
  });

  test("ignores Enter key during IME composition (keyCode 229)", async () => {
    const onChange = vi.fn();
    await renderWithChakra(
      <div data-testid="container">
        <EditableTitle onChange={onChange} />
      </div>
    );
    const editButton = page.getByRole("button", { name: "Edit" });
    await editButton.click();

    const input = page.getByRole("textbox");
    await input.fill("テスト");

    // Simulate Enter key during IME composition (keyCode 229)
    await input.element().dispatchEvent(
      new KeyboardEvent("keydown", { keyCode: 229, bubbles: true })
    );

    // Should still be in edit mode
    await expect
      .element(page.getByRole("button", { name: "Submit" }))
      .toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });
});
