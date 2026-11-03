import {
  closeDialog,
  expect,
  expectBlocked,
  expectLoaded,
  importRules,
  setRulesEnabled,
  test,
} from "./fixtures";

/** An exported file with one rule set holding the given rules */
function exportedFile(rules: object[]) {
  const content = { format: "BLOCKoli", version: 1, ruleSets: [{ name: "Imported", rules }] };
  return {
    name: "rules.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(content)),
  };
}

test("the rule editor accepts only a regular expression Chrome can run", async ({
  optionsPage: page,
  serverOrigin,
}) => {
  await page.getByRole("button", { name: "Add a Rule Set" }).click();
  const useRegex = page.getByRole("checkbox", { name: "Use regex" });
  // Chakra covers the checkbox's hidden input with its visible control
  await useRegex.dispatchEvent("click");
  await expect(useRegex).toBeChecked();

  // RE2 has no backreferences
  const urlFilter = page.getByRole("textbox", { name: "URL Filter" });
  await urlFilter.fill("/(a)\\1");
  await expect(urlFilter).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("syntaxError")).toBeVisible();
  await expect(page.getByRole("button", { name: "Save" })).toBeDisabled();

  await urlFilter.fill("/regex/[0-9]+$");
  await expect(urlFilter).not.toHaveAttribute("aria-invalid", "true");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("button", { name: "Save" })).toBeHidden();

  await setRulesEnabled(page, true);
  await expectBlocked(page, `${serverOrigin}/regex/42`);
  await expectLoaded(page, `${serverOrigin}/regex/abc`);
});

test("an import with a regular expression Chrome cannot run adds nothing", async ({
  optionsPage: page,
}) => {
  const result = await importRules(
    page,
    exportedFile([
      { action: { type: "block" }, condition: { urlFilter: "/plain" } },
      // RE2 has no backreferences
      { action: { type: "block" }, condition: { urlFilter: "/(a)\\1", isRegexFilter: true } },
    ])
  );
  await expect(result).toContainText("Import failed");
  await expect(result).toContainText("syntaxError");
  await closeDialog(page, result);
  await expect(page.getByText("There are no rule sets available.")).toBeVisible();
});
