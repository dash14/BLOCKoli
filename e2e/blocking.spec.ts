import { enableRules, expect, expectBlocked, expectLoaded, test } from "./fixtures";

test("blocks requests that match a saved rule only while rules are enabled", async ({
  context,
  optionsPage: page,
  serverOrigin,
}) => {
  await page.getByRole("button", { name: "Add a Rule Set" }).click();
  await page.getByRole("textbox", { name: "URL Filter" }).fill("/blocked");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("button", { name: "Save" })).toBeHidden();

  await enableRules(page);
  await expectBlocked(context, `${serverOrigin}/blocked`);
  await expectLoaded(context, `${serverOrigin}/allowed`);

  const enableRulesSwitch = page.getByRole("checkbox", { name: "Enable rules" });
  await enableRulesSwitch.dispatchEvent("click");
  await expect(enableRulesSwitch).not.toBeChecked();
  await expect(async () => {
    await expectLoaded(context, `${serverOrigin}/blocked`);
  }).toPass();
});
