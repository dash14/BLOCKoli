import { describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithChakra } from "@/test/utils/render";
import { RemoveDialog } from "./RemoveDialog";

describe("RemoveDialog component", () => {
  test("renders dialog when open", async () => {
    const onClose = vi.fn();
    const onPerform = vi.fn();
    await renderWithChakra(
      <RemoveDialog
        title="Delete Item"
        open={true}
        onClose={onClose}
        onPerform={onPerform}
      />
    );

    await expect.element(page.getByText("Delete Item")).toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "Cancel" }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "Remove" }))
      .toBeInTheDocument();

    const dialog = page.getByRole("alertdialog");
    await expect(dialog).toMatchScreenshot("RemoveDialog-open");
  });

  test("calls onClose when Cancel is clicked", async () => {
    const onClose = vi.fn();
    const onPerform = vi.fn();
    await renderWithChakra(
      <RemoveDialog
        title="Delete Item"
        open={true}
        onClose={onClose}
        onPerform={onPerform}
      />
    );

    const cancelButton = page.getByRole("button", { name: "Cancel" });
    await cancelButton.click();

    expect(onClose).toHaveBeenCalled();
  });

  test("calls onPerform when Remove is clicked", async () => {
    const onClose = vi.fn();
    const onPerform = vi.fn();
    await renderWithChakra(
      <RemoveDialog
        title="Delete Item"
        open={true}
        onClose={onClose}
        onPerform={onPerform}
      />
    );

    const removeButton = page.getByRole("button", { name: "Remove" });
    await removeButton.click();

    expect(onPerform).toHaveBeenCalled();
  });

  test("uses default title when not provided", async () => {
    const onClose = vi.fn();
    const onPerform = vi.fn();
    await renderWithChakra(
      <RemoveDialog open={true} onClose={onClose} onPerform={onPerform} />
    );

    // Check that the header contains the default title "Remove"
    // In v3, look for the header element specifically by class
    const dialog = page.getByRole("alertdialog");
    await expect.element(dialog).toBeInTheDocument();
    // Verify the dialog title is "Remove" by checking the header div
    const headerText = await dialog
      .query()
      ?.querySelector(".chakra-dialog__header")?.textContent;
    expect(headerText).toBe("Remove");
  });

  test("calls onClose when Escape key is pressed", async () => {
    const onClose = vi.fn();
    const onPerform = vi.fn();
    await renderWithChakra(
      <RemoveDialog
        title="Delete Item"
        open={true}
        onClose={onClose}
        onPerform={onPerform}
      />
    );

    await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();

    // Press Escape key to close the dialog
    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalled();
  });
});
