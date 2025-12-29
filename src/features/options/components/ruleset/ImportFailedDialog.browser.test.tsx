import { useRef } from "react";
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
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
            { message: "invalid_format", ruleSetNumber: 0, ruleSetField: "rules" },
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

describe("ImportFailedDialog component", () => {
  test("renders dialog with errors", async () => {
    await renderWithChakra(<TestWrapper />);
    await page.getByRole("button", { name: "Open" }).click();
    await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();
    await expect(page.getByRole("alertdialog")).toMatchScreenshot(
      "ImportFailedDialog-open"
    );
  });
});
