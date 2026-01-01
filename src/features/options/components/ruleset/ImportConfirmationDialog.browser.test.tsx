import { useRef } from "react";
import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { useI18n } from "@/hooks/useI18n";
import { renderWithChakra } from "@/test/utils/render";
import {
  ImportConfirmationDialog,
  ImportConfirmationDialogHandle,
} from "./ImportConfirmationDialog";

function TestWrapper() {
  const i18n = useI18n();
  const ref = useRef<ImportConfirmationDialogHandle>(null);
  return (
    <>
      <button onClick={() => ref.current?.open()}>Open</button>
      <ImportConfirmationDialog ref={ref} i18n={i18n} />
    </>
  );
}

describe("ImportConfirmationDialog component", () => {
  test("renders dialog when opened", async () => {
    await renderWithChakra(<TestWrapper />);
    await page.getByRole("button", { name: "Open" }).click();
    await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();
    await expect(page.getByRole("alertdialog")).toMatchScreenshot(
      "ImportConfirmationDialog-open"
    );
  });

  test("closes dialog when Escape key is pressed", async () => {
    await renderWithChakra(<TestWrapper />);
    await page.getByRole("button", { name: "Open" }).click();
    await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();

    // Press Escape key to close the dialog
    await userEvent.keyboard("{Escape}");

    // Dialog should be closed
    await expect.element(page.getByRole("alertdialog")).not.toBeInTheDocument();
  });
});
