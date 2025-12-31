import { describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithChakra } from "@/test/utils/render";
import { FileInput } from "./FileInput";

describe("FileInput component", () => {
  test("renders file input with accept attribute", async () => {
    const onSelectFile = vi.fn();
    await renderWithChakra(
      <div data-testid="container">
        <FileInput accept=".json" onSelectFile={onSelectFile} />
      </div>
    );
    const input = page.getByRole("textbox");
    await expect.element(input).toBeInTheDocument();
    await expect.element(input).toHaveAttribute("accept", ".json");
    await expect.element(input).toHaveAttribute("type", "file");

    // reset hover/focus states before screenshot
    await userEvent.unhover(page.getByRole("document"));
    const container = page.getByTestId("container");
    await expect(container).toMatchScreenshot("FileInput-default");
  });

  test("calls onSelectFile when file is selected", async () => {
    const onSelectFile = vi.fn();
    await renderWithChakra(
      <FileInput accept=".json" onSelectFile={onSelectFile} />
    );

    const input = page.getByRole("textbox");
    const inputElement = (await input.element()) as HTMLInputElement;

    // Create a mock file
    const file = new File(["{}"], "test.json", { type: "application/json" });

    // Create a DataTransfer and add the file
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    // Set files on input and dispatch change event
    inputElement.files = dataTransfer.files;
    inputElement.dispatchEvent(new Event("change", { bubbles: true }));

    expect(onSelectFile).toHaveBeenCalledTimes(1);
    expect(onSelectFile).toHaveBeenCalledWith(file, inputElement);
  });

  test("does not call onSelectFile when no file is selected", async () => {
    const onSelectFile = vi.fn();
    await renderWithChakra(
      <FileInput accept=".json" onSelectFile={onSelectFile} />
    );

    const input = page.getByRole("textbox");
    const inputElement = (await input.element()) as HTMLInputElement;

    // Dispatch change event without files
    inputElement.dispatchEvent(new Event("change", { bubbles: true }));

    expect(onSelectFile).not.toHaveBeenCalled();
  });
});
