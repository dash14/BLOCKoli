import { describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
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

    // reset hover/focus states before screenshot
    await userEvent.unhover(page.getByRole("document"));
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
    // reset hover/focus states before screenshot
    await userEvent.unhover(page.getByRole("document"));
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
    await input
      .element()
      .dispatchEvent(
        new KeyboardEvent("keydown", { keyCode: 229, bubbles: true })
      );

    // Should still be in edit mode
    await expect
      .element(page.getByRole("button", { name: "Submit" }))
      .toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  test("enters edit mode on double click", async () => {
    const onChange = vi.fn();
    await renderWithChakra(
      <EditableTitle defaultValue="Test Title" onChange={onChange} />
    );

    // Double click on preview text to enter edit mode
    const preview = page.getByText("Test Title");
    await userEvent.dblClick(preview.element());

    // Should be in edit mode
    await expect
      .element(page.getByRole("button", { name: "Submit" }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "Cancel" }))
      .toBeInTheDocument();
  });

  test("calls preventDefault for IME Enter key (keyCode 229)", async () => {
    const onChange = vi.fn();
    await renderWithChakra(<EditableTitle onChange={onChange} />);

    // Enter edit mode
    await page.getByRole("button", { name: "Edit" }).click();

    const input = page.getByRole("textbox");
    const inputElement = await input.element();

    // Create keydown event with keyCode 229 (IME) and spy on preventDefault
    const event = new KeyboardEvent("keydown", {
      keyCode: 229,
      bubbles: true,
      cancelable: true,
    });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    inputElement.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  test("stops propagation when clicking input", async () => {
    const onChange = vi.fn();
    await renderWithChakra(<EditableTitle onChange={onChange} />);

    // Enter edit mode
    await page.getByRole("button", { name: "Edit" }).click();

    const input = page.getByRole("textbox");
    const inputElement = await input.element();

    // Create click event and spy on stopPropagation
    const event = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });
    const stopPropagationSpy = vi.spyOn(event, "stopPropagation");

    inputElement.dispatchEvent(event);

    expect(stopPropagationSpy).toHaveBeenCalled();
  });
});
