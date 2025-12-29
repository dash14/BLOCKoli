import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithChakra } from "@/test/utils/render";
import { HintPopover } from "./HintPopover";

describe("HintPopover component", () => {
  test("renders hint button", async () => {
    await renderWithChakra(
      <div data-testid="container">
        <HintPopover title="Help" contentWidth={200}>
          This is helpful information.
        </HintPopover>
      </div>
    );
    const button = page.getByRole("button", { name: "hint" });
    await expect.element(button).toBeInTheDocument();

    // reset hover/focus states before screenshot
    await userEvent.unhover(page.getByRole("document"));
    const container = page.getByTestId("container");
    await expect(container).toMatchScreenshot("HintPopover-closed");
  });

  test("opens popover when clicked", async () => {
    await renderWithChakra(
      <div data-testid="container">
        <HintPopover title="Help Title" contentWidth={250}>
          This is the popover content.
        </HintPopover>
      </div>
    );
    const button = page.getByRole("button", { name: "hint" });
    await button.click();

    await expect.element(page.getByText("Help Title")).toBeInTheDocument();
    await expect
      .element(page.getByText("This is the popover content."))
      .toBeInTheDocument();

    // VRT for open state - capture full page since popover is portaled
    await expect(page.getByRole("dialog")).toMatchScreenshot(
      "HintPopover-open"
    );
  });
});
