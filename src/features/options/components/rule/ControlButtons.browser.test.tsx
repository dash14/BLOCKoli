import { describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithChakra } from "@/test/utils/render";
import { ControlButtons } from "./ControlButtons";

describe("ControlButtons component", () => {
  test("renders save and cancel buttons", async () => {
    await renderWithChakra(
      <div data-testid="container">
        <ControlButtons
          save={() => {}}
          cancel={() => {}}
          remove={() => {}}
          isValid={true}
          isRemoveEnabled={false}
        />
      </div>
    );
    await expect
      .element(page.getByRole("button", { name: /save/i }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: /cancel/i }))
      .toBeInTheDocument();

    // reset hover/focus states before screenshot
    await userEvent.click(document.body);
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "ControlButtons-default"
    );
  });

  test("disables save button when invalid", async () => {
    await renderWithChakra(
      <div data-testid="container">
        <ControlButtons
          save={() => {}}
          cancel={() => {}}
          remove={() => {}}
          isValid={false}
          isRemoveEnabled={false}
        />
      </div>
    );
    await expect
      .element(page.getByRole("button", { name: /save/i }))
      .toBeDisabled();

    // reset hover/focus states before screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "ControlButtons-disabled"
    );
  });

  test("renders remove button when enabled", async () => {
    await renderWithChakra(
      <div data-testid="container">
        <ControlButtons
          save={() => {}}
          cancel={() => {}}
          remove={() => {}}
          isValid={true}
          isRemoveEnabled={true}
        />
      </div>
    );
    await expect
      .element(page.getByRole("button", { name: /remove/i }))
      .toBeInTheDocument();

    // reset hover/focus states before screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "ControlButtons-with-remove"
    );
  });

  test("calls save callback when clicked", async () => {
    const save = vi.fn();
    await renderWithChakra(
      <ControlButtons
        save={save}
        cancel={() => {}}
        remove={() => {}}
        isValid={true}
        isRemoveEnabled={false}
      />
    );
    await page.getByRole("button", { name: /save/i }).click();
    expect(save).toHaveBeenCalled();
  });

  test("calls cancel callback when clicked", async () => {
    const cancel = vi.fn();
    await renderWithChakra(
      <ControlButtons
        save={() => {}}
        cancel={cancel}
        remove={() => {}}
        isValid={true}
        isRemoveEnabled={false}
      />
    );
    await page.getByRole("button", { name: /cancel/i }).click();
    expect(cancel).toHaveBeenCalled();
  });
});
