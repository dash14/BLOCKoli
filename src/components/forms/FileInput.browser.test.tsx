import { describe, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
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

    const container = page.getByTestId("container");
    await expect(container).toMatchScreenshot("FileInput-default");
  });
});
