import {
  setChecked,
  expect,
  expectBlocked,
  expectImportFailed,
  expectLoaded,
  exportedFile,
  setRulesEnabled,
  test,
} from "./fixtures";

test("the rule editor accepts only a regular expression Chrome can run", async ({
  optionsPage: page,
  serverOrigin,
}) => {
  await page.getByRole("button", { name: "Add a Rule Set" }).click();
  await setChecked(page.getByRole("checkbox", { name: "Use regex" }), true);

  // RE2 has no backreferences
  const urlFilter = page.getByRole("textbox", { name: "URL Filter" });
  await urlFilter.fill("/(a)\\1");
  await expect(urlFilter).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("syntaxError")).toBeVisible();
  await expect(page.getByRole("button", { name: "Save" })).toBeDisabled();

  await urlFilter.fill("/regex/[0-9]+$");
  // Chrome checks the pattern asynchronously
  await expect(page.getByText("syntaxError")).toBeHidden();
  await expect(urlFilter).not.toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("button", { name: "Save" })).toBeEnabled();
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("button", { name: "Save" })).toBeHidden();

  await setRulesEnabled(page, true);
  await expectBlocked(page, `${serverOrigin}/regex/42`);
  await expectLoaded(page, `${serverOrigin}/regex/abc`);
});

test("an import with a regular expression Chrome cannot run adds nothing", async ({
  optionsPage: page,
}) => {
  await expectImportFailed(
    page,
    exportedFile({
      name: "Imported",
      rules: [
        { action: { type: "block" }, condition: { urlFilter: "/plain" } },
        // RE2 has no backreferences
        { action: { type: "block" }, condition: { urlFilter: "/(a)\\1", isRegexFilter: true } },
      ],
    }),
    "syntaxError"
  );
});
