import { useRef } from "react";
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { useI18n } from "@/hooks/useI18n";
import { renderWithChakra } from "@/test/utils/render";
import {
  ImportSucceededDialog,
  ImportSucceededDialogHandle,
} from "./ImportSucceededDialog";

function TestWrapper() {
  const i18n = useI18n();
  const ref = useRef<ImportSucceededDialogHandle>(null);
  return (
    <>
      <button onClick={() => ref.current?.open()}>Open</button>
      <ImportSucceededDialog ref={ref} i18n={i18n} />
    </>
  );
}

describe("ImportSucceededDialog component", () => {
  test("renders dialog when opened", async () => {
    await renderWithChakra(<TestWrapper />);
    await page.getByRole("button", { name: "Open" }).click();
    await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();
    await expect(page.getByRole("alertdialog")).toMatchScreenshot(
      "ImportSucceededDialog-open"
    );
  });
});
