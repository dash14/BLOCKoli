import {
  closeDialog,
  expect,
  expectBlocked,
  expectLoaded,
  exportedFile,
  importRules,
  setRulesEnabled,
  test,
} from "./fixtures";

// Chrome refuses the whole rule update for a domain with non-ASCII characters
const nonAsciiDomain = "例え.jp";

test("the rule editor accepts only ASCII domains", async ({
  optionsPage: page,
  serverOrigin,
}) => {
  await page.getByRole("button", { name: "Add a Rule Set" }).click();
  const requestDomains = page.getByRole("textbox", { name: "Request Domains" });
  const save = page.getByRole("button", { name: "Save" });

  await requestDomains.fill(nonAsciiDomain);
  await expect(requestDomains).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("must not contain non-ascii code and space")).toBeVisible();
  await expect(save).toBeDisabled();

  await requestDomains.fill(new URL(serverOrigin).hostname);
  await page.getByRole("textbox", { name: "URL Filter" }).fill("/domain");
  await expect(requestDomains).not.toHaveAttribute("aria-invalid", "true");
  await save.click();
  await expect(save).toBeHidden();

  await setRulesEnabled(page, true);
  await expectBlocked(page, `${serverOrigin}/domain`);
  await expectLoaded(page, `${serverOrigin}/other`);
});

test("an import passes an empty domain list to Chrome as no domain condition", async ({
  optionsPage: page,
  serverOrigin,
}) => {
  await setRulesEnabled(page, true);

  // Chrome refuses an empty list, so the rule must reach it without one
  const result = await importRules(
    page,
    exportedFile({
      name: "Imported",
      rules: [
        {
          action: { type: "block" },
          condition: { requestDomains: [], initiatorDomains: [], urlFilter: "/empty-domains" },
        },
      ],
    })
  );
  await expect(result).toContainText("Import succeeded");
  await closeDialog(page, result);
  await expectBlocked(page, `${serverOrigin}/empty-domains`);
});

test("an import with a non-ASCII domain adds nothing", async ({ optionsPage: page }) => {
  const result = await importRules(
    page,
    exportedFile({
      name: "Imported",
      rules: [
        { action: { type: "block" }, condition: { urlFilter: "/plain" } },
        { action: { type: "block" }, condition: { requestDomains: [nonAsciiDomain] } },
      ],
    })
  );
  await expect(result).toContainText("Import failed");
  await expect(result).toContainText("must not contain non-ascii code and space");
  await closeDialog(page, result);
  // Read the rule sets from storage again, rather than what the page holds
  await page.reload();
  await expect(page.getByText("There are no rule sets available.")).toBeVisible();
});
