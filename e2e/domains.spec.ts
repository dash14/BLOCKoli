import {
  closeDialog,
  expect,
  expectBlocked,
  expectImportFailed,
  expectLoaded,
  exportedFile,
  importRules,
  setRulesEnabled,
  test,
} from "./fixtures";

// Chrome refuses the whole rule update for a domain with non-ASCII characters
const nonAsciiDomain = "例え.jp";

test("the rule editor accepts only ASCII domains, and Chrome matches the host", async ({
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

  // Another host first, so the URL filter alone cannot block the request
  await requestDomains.fill("other.example");
  await page.getByRole("textbox", { name: "URL Filter" }).fill("/domain");
  await expect(requestDomains).not.toHaveAttribute("aria-invalid", "true");
  await save.click();
  await expect(save).toBeHidden();
  await setRulesEnabled(page, true);
  await expectLoaded(page, `${serverOrigin}/domain`);

  // The rule set title has an icon-only Edit button too
  await page.getByRole("button", { name: "Edit" }).filter({ hasText: "Edit" }).click();
  await requestDomains.fill(new URL(serverOrigin).hostname);
  await save.click();
  await expect(save).toBeHidden();
  await expectBlocked(page, `${serverOrigin}/domain`);
  await expectLoaded(page, `${serverOrigin}/other`);
});

for (const field of ["requestDomains", "initiatorDomains"]) {
  test(`an import passes an empty ${field} list to Chrome as no condition`, async ({
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
          { action: { type: "block" }, condition: { [field]: [], urlFilter: "/empty-domains" } },
        ],
      })
    );
    await expect(result).toContainText("Import succeeded");
    await closeDialog(page, result);
    await expectBlocked(page, `${serverOrigin}/empty-domains`);
    await expectLoaded(page, `${serverOrigin}/other`);
  });

  test(`an import with a non-ASCII domain in ${field} adds nothing`, async ({
    optionsPage: page,
  }) => {
    await expectImportFailed(
      page,
      exportedFile({
        name: "Imported",
        rules: [
          { action: { type: "block" }, condition: { urlFilter: "/plain" } },
          { action: { type: "block" }, condition: { [field]: [nonAsciiDomain] } },
        ],
      }),
      "must not contain non-ascii code and space"
    );
  });
}
