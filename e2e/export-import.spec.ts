import { readFile } from "node:fs/promises";
import {
  closeDialog,
  expect,
  expectBlocked,
  expectLoaded,
  importRules,
  saveRule,
  setRulesEnabled,
  test,
} from "./fixtures";
import type { Page } from "@playwright/test";

async function exportRules(page: Page) {
  await page.getByRole("button", { name: "Import and Export Rules" }).click();
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const download = await downloading;
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  return download.path();
}

test("restores rule sets with several rules from an exported file", async ({
  optionsPage: page,
  launchBrowser,
  serverOrigin,
}) => {
  await page.getByRole("button", { name: "Add a Rule Set" }).click();
  await saveRule(page, "block", "/first");
  await page.getByRole("button", { name: "Add a Rule", exact: true }).click();
  await saveRule(page, "allow", "/first/allowed");
  await page.getByRole("button", { name: "Add a Rule Set" }).click();
  await saveRule(page, "block", "/second");

  const exportedPath = await exportRules(page);

  // Import into a new profile, which has no rule sets yet
  const other = await launchBrowser();
  const otherPage = await other.openOptions();
  const result = await importRules(otherPage, exportedPath);
  await expect(result).toContainText("Import succeeded");
  await closeDialog(otherPage, result);

  await expect(otherPage.getByText("My Rule Set 1")).toBeVisible();
  await expect(otherPage.getByText("My Rule Set 2")).toBeVisible();

  await setRulesEnabled(otherPage, true);
  await expectBlocked(otherPage, `${serverOrigin}/first`);
  await expectBlocked(otherPage, `${serverOrigin}/second`);
  await expectLoaded(otherPage, `${serverOrigin}/first/allowed`);
  await expectLoaded(otherPage, `${serverOrigin}/other`);

  // Exporting again gives the same rules back
  const reexportedPath = await exportRules(otherPage);
  expect(JSON.parse(await readFile(reexportedPath, "utf8"))).toEqual(
    JSON.parse(await readFile(exportedPath, "utf8"))
  );
});
