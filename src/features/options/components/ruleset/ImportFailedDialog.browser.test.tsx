import { useRef } from "react";
import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { useI18n } from "@/hooks/useI18n";
import { renderWithChakra } from "@/test/utils/render";
import {
  ImportFailedDialog,
  ImportFailedDialogHandle,
} from "./ImportFailedDialog";

function TestWrapper() {
  const i18n = useI18n();
  const ref = useRef<ImportFailedDialogHandle>(null);
  return (
    <>
      <button
        onClick={() =>
          ref.current?.open([
            {
              message: "invalid_format",
              ruleSetNumber: 0,
              ruleSetField: "rules",
            },
            {
              message: "required",
              ruleSetNumber: 1,
              ruleSetField: "rules",
              ruleNumber: 0,
              ruleField: "urlFilter",
            },
          ])
        }
      >
        Open
      </button>
      <ImportFailedDialog ref={ref} i18n={i18n} />
    </>
  );
}

function TestWrapperWithNoRuleSetNumber() {
  const i18n = useI18n();
  const ref = useRef<ImportFailedDialogHandle>(null);
  return (
    <>
      <button
        onClick={() =>
          ref.current?.open([
            { message: "invalid_format" }, // No ruleSetNumber - tests line 70
          ])
        }
      >
        Open
      </button>
      <ImportFailedDialog ref={ref} i18n={i18n} />
    </>
  );
}

describe("ImportFailedDialog component", () => {
  test("renders dialog with errors", async () => {
    await renderWithChakra(<TestWrapper />);
    await page.getByRole("button", { name: "Open" }).click();
    await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();
    await expect(page.getByRole("alertdialog")).toMatchScreenshot(
      "ImportFailedDialog-open"
    );
  });

  test("closes dialog when close button is clicked", async () => {
    await renderWithChakra(<TestWrapper />);
    await page.getByRole("button", { name: "Open" }).click();
    await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();

    // Click Close button to trigger onDialogClose (line 46)
    await page.getByRole("button", { name: "Close" }).click();

    // Dialog should be closed
    await expect.element(page.getByRole("alertdialog")).not.toBeInTheDocument();
  });

  test("renders error without ruleSetNumber (covers empty return path)", async () => {
    await renderWithChakra(<TestWrapperWithNoRuleSetNumber />);
    await page.getByRole("button", { name: "Open" }).click();
    await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();

    // The dialog renders with error that has no ruleSetNumber
    // This triggers getAdditionalErrorText to return "" (line 70)
    // Verify dialog header is present
    await expect.element(page.getByText("Import failed")).toBeInTheDocument();
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
