import { expect, expectBlocked, expectLoaded, saveRule, setRulesEnabled, test } from "./fixtures";

test("blocks requests that match a saved rule only while rules are enabled", async ({
  context,
  optionsPage: page,
  serverOrigin,
}) => {
  await page.getByRole("button", { name: "Add a Rule Set" }).click();
  await saveRule(page, "block", "/blocked");

  await setRulesEnabled(page, true);
  await expectBlocked(context, `${serverOrigin}/blocked`);
  await expectLoaded(context, `${serverOrigin}/allowed`);

  await setRulesEnabled(page, false);
  await expect(async () => {
    await expectLoaded(context, `${serverOrigin}/blocked`);
  }).toPass();
});
