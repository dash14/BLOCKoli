import { readFile } from "node:fs/promises";
import { expect, expectBlocked, expectLoaded, saveRule, setRulesEnabled, test } from "./fixtures";
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
  await otherPage.getByRole("button", { name: "Import and Export Rules" }).click();
  await otherPage.getByLabel("Import rules").setInputFiles(exportedPath);
  await otherPage.getByRole("button", { name: "Import", exact: true }).click();
  const succeeded = otherPage
    .getByRole("alertdialog")
    .filter({ hasText: "Import succeeded" });
  await succeeded.getByRole("button", { name: "Close" }).click();
  await expect(otherPage.getByRole("alertdialog")).toHaveCount(0);

  await expect(otherPage.getByText("My Rule Set 1")).toBeVisible();
  await expect(otherPage.getByText("My Rule Set 2")).toBeVisible();

  await setRulesEnabled(otherPage, true);
  await expectBlocked(other.context, `${serverOrigin}/first`);
  await expectBlocked(other.context, `${serverOrigin}/second`);
  await expectLoaded(other.context, `${serverOrigin}/first/allowed`);
  await expectLoaded(other.context, `${serverOrigin}/other`);

  // Exporting again gives the same rules back
  const reexportedPath = await exportRules(otherPage);
  expect(JSON.parse(await readFile(reexportedPath, "utf8"))).toEqual(
    JSON.parse(await readFile(exportedPath, "utf8"))
  );
});
