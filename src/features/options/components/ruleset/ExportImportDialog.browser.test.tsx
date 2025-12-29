import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
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
});
