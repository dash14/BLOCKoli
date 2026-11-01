import { describe, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { useI18n } from "@/hooks/useI18n";
import { renderWithChakra } from "@/test/utils/render";
import { ExportImportDialog } from "./ExportImportDialog";

// Without a mounted confirmation dialog its ref stays null.
vi.mock("./ImportConfirmationDialog", () => ({
  ImportConfirmationDialog: () => null,
}));

function TestWrapper({ onImport }: { onImport: (file: File) => void }) {
  const i18n = useI18n();
  return (
    <ExportImportDialog
      isEnableExport={true}
      onExport={() => {}}
      onImport={onImport}
      i18n={i18n}
    />
  );
}

describe("ExportImportDialog without the confirmation dialog", () => {
  test("does not import the selected file", async () => {
    const onImport = vi.fn();
    await renderWithChakra(<TestWrapper onImport={onImport} />);
    await page.getByRole("button", { name: /import/i }).click();
    await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File(["{}"], "rules.json"));
    input.files = dataTransfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));

    await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();
    expect(onImport).not.toHaveBeenCalled();
  });
});
