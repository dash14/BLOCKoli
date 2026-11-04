import {
  closeDialog,
  expect,
  expectBlocked,
  exportedFile,
  importRules,
  setRulesEnabled,
  test,
} from "./fixtures";

// The extension's own limit, MAX_RULES in src/modules/rules/limits.ts
const maxRules = 500;

const blockRules = (prefix: string, count: number) =>
  Array.from({ length: count }, (_, i) => ({
    action: { type: "block" },
    condition: { urlFilter: `/${prefix}/${i}/` },
  }));

test("imports rules up to the limit, and refuses one more", async ({
  optionsPage: page,
  serverOrigin,
}) => {
  await setRulesEnabled(page, true);

  // With two rule sets, both start closed and the page does not render every rule
  const accepted = await importRules(
    page,
    exportedFile(
      { name: "Full", rules: blockRules("full", maxRules - 1) },
      { name: "Last", rules: blockRules("last", 1) }
    )
  );
  await expect(accepted).toContainText("Import succeeded");
  await closeDialog(page, accepted);
  await expectBlocked(page, `${serverOrigin}/full/${maxRules - 2}/`);
  await expectBlocked(page, `${serverOrigin}/last/0/`);

  // A rule set of another name is added rather than replacing a stored one
  const refused = await importRules(page, exportedFile({ name: "Over", rules: blockRules("over", 1) }));
  await expect(refused).toContainText("Import failed");
  await expect(refused).toContainText(
    `Too many rules: ${maxRules + 1}, but at most ${maxRules} can be defined`
  );
  await closeDialog(page, refused);
  // Read the rule sets from storage again, rather than what the page holds
  await page.reload();
  await expect(page.getByText("Full")).toBeVisible();
  await expect(page.getByText("Last")).toBeVisible();
  await expect(page.getByText("Over")).toBeHidden();
});

test("tells why a rule was not saved when the rules filled up while it was edited", async ({
  optionsPage: page,
}) => {
  const imported = await importRules(
    page,
    exportedFile(
      { name: "Full", rules: blockRules("full", maxRules - 2) },
      { name: "Last", rules: blockRules("last", 1) }
    )
  );
  await closeDialog(page, imported);

  // The page counts the rule being added, so this is the 500th
  await page.getByRole("button", { name: "Add a Rule Set" }).click();
  const requestDomains = page.getByRole("textbox", { name: "Request Domains" });
  await requestDomains.fill("typed.example");

  const filled = await importRules(page, exportedFile({ name: "Over", rules: blockRules("over", 1) }));
  await expect(filled).toContainText("Import succeeded");
  await closeDialog(page, filled);

  await page.getByRole("button", { name: "Save" }).click();
  const refused = page.getByRole("alertdialog");
  await expect(refused).toContainText("Save failed");
  await expect(
    refused.getByText(`Too many rules: ${maxRules + 1}, but at most ${maxRules} can be defined`, {
      exact: true,
    })
  ).toBeVisible();
  await closeDialog(page, refused);
  await expect(requestDomains).toHaveValue("typed.example");
  await expect(page.getByRole("button", { name: "Save" })).toBeEnabled();

  await page.reload();
  await expect(page.getByText("Over")).toBeVisible();
  await expect(page.getByText("My Rule Set 1")).toBeHidden();
});
