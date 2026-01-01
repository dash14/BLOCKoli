import { describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { useI18n } from "@/hooks/useI18n";
import { renderWithChakra } from "@/test/utils/render";
import { ExportImportDialog } from "./ExportImportDialog";

function TestWrapper({ isEnableExport = true }: { isEnableExport?: boolean }) {
  const i18n = useI18n();
  return (
    <div data-testid="container">
      <ExportImportDialog
        isEnableExport={isEnableExport}
        onExport={() => {}}
        onImport={() => {}}
        i18n={i18n}
      />
    </div>
  );
}

describe("ExportImportDialog component", () => {
  test("renders trigger button", async () => {
    await renderWithChakra(<TestWrapper />);
    await expect
      .element(page.getByRole("button", { name: /import/i }))
      .toBeInTheDocument();
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "ExportImportDialog-button"
    );
  });

  test("renders dialog when opened", async () => {
    await renderWithChakra(<TestWrapper />);
    await page.getByRole("button", { name: /import/i }).click();
    await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();
    await expect(page.getByRole("alertdialog")).toMatchScreenshot(
      "ExportImportDialog-open"
    );
  });

  test("disables export button when not enabled", async () => {
    await renderWithChakra(<TestWrapper isEnableExport={false} />);
    await page.getByRole("button", { name: /import/i }).click();
    await expect
      .element(page.getByRole("button", { name: /^export$/i }))
      .toBeDisabled();
    await expect(page.getByRole("alertdialog")).toMatchScreenshot(
      "ExportImportDialog-export-disabled"
    );
  });

  test("imports file when confirmation is accepted", async () => {
    const onImport = vi.fn();
    const onExport = vi.fn();
    const i18n = {
      ImportAndExportRules: "Import/Export",
      ImportRules: "Import Rules",
      ExportRules: "Export Rules",
      import_description1: "Import description 1",
      import_description2: "Import description 2",
      import_description3: "Import description 3",
      import_description4: "Import description 4",
      export_description: "Export description",
      Export: "Export",
      Close: "Close",
      Import: "Import",
      Cancel: "Cancel",
    };

    await renderWithChakra(
      <ExportImportDialog
        isEnableExport={true}
        onExport={onExport}
        onImport={onImport}
        i18n={i18n}
      />
    );

    // Open the dialog
    await page.getByRole("button", { name: /import/i }).click();
    await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();

    // Find the file input and select a file
    const inputElement = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = new File(["test content"], "rules.json", {
      type: "application/json",
    });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    inputElement.files = dataTransfer.files;
    inputElement.dispatchEvent(new Event("change", { bubbles: true }));

    // Wait for confirmation dialog to appear (second dialog with Import button)
    await expect
      .element(page.getByRole("button", { name: "Import", exact: true }).nth(0))
      .toBeInTheDocument();

    // Click Import to confirm (in the confirmation dialog)
    await page
      .getByRole("button", { name: "Import", exact: true })
      .nth(0)
      .click();

    // Verify onImport was called with the file
    expect(onImport).toHaveBeenCalledWith(file);
  });

  test("cancels import when confirmation is declined", async () => {
    const onImport = vi.fn();
    const onExport = vi.fn();
    const i18n = {
      ImportAndExportRules: "Import/Export",
      ImportRules: "Import Rules",
      ExportRules: "Export Rules",
      import_description1: "Import description 1",
      import_description2: "Import description 2",
      import_description3: "Import description 3",
      import_description4: "Import description 4",
      export_description: "Export description",
      Export: "Export",
      Close: "Close",
      Import: "Import",
      Cancel: "Cancel",
    };

    await renderWithChakra(
      <ExportImportDialog
        isEnableExport={true}
        onExport={onExport}
        onImport={onImport}
        i18n={i18n}
      />
    );

    // Open the dialog
    await page.getByRole("button", { name: /import/i }).click();
    await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();

    // Find the file input and select a file
    const inputElement = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = new File(["test content"], "rules.json", {
      type: "application/json",
    });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    inputElement.files = dataTransfer.files;
    inputElement.dispatchEvent(new Event("change", { bubbles: true }));

    // Wait for confirmation dialog Cancel button to appear
    await expect
      .element(page.getByRole("button", { name: "Cancel" }))
      .toBeInTheDocument();

    // Click Cancel to decline
    await page.getByRole("button", { name: "Cancel" }).click();

    // Verify onImport was NOT called
    expect(onImport).not.toHaveBeenCalled();
  });

  test("closes dialog when Escape key is pressed", async () => {
    await renderWithChakra(<TestWrapper />);

    // Open the dialog
    await page.getByRole("button", { name: /import/i }).click();
    await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();

    // Press Escape key to close the dialog
    await userEvent.keyboard("{Escape}");

    // Dialog should be closed
    await expect.element(page.getByRole("alertdialog")).not.toBeInTheDocument();
  });
});
