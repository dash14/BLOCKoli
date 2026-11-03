import { expect, saveRule, setRulesEnabled, test, type ExtensionBrowser } from "./fixtures";

async function openPopup({ context, extensionId }: ExtensionBrowser) {
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  return popup;
}

test("the popup and the options page show each other's changes", async ({
  extension,
  optionsPage: page,
}) => {
  const popup = await openPopup(extension);
  await expect(popup.getByRole("link", { name: "Configure rules" })).toBeVisible();
  const popupSwitch = popup.getByRole("checkbox", { name: "Enable rules" });
  await expect(popupSwitch).toBeHidden();

  await page.bringToFront();
  await page.getByRole("button", { name: "Add a Rule Set" }).click();
  await saveRule(page, "block", "/blocked");
  await expect(popupSwitch).not.toBeChecked();

  await setRulesEnabled(page, true);
  await expect(popupSwitch).toBeChecked();

  await setRulesEnabled(popup, false);
  await expect(page.getByRole("checkbox", { name: "Enable rules" })).not.toBeChecked();
});

test("only the options page opened last edits, and shows the latest rule sets", async ({
  extension,
  optionsPage: first,
}) => {
  const editHere = (page: typeof first) =>
    page.getByRole("button", { name: "Edit in this tab" });

  await first.getByRole("button", { name: "Add a Rule Set" }).click();
  await saveRule(first, "block", "/first");

  // A page opened later takes over the editing
  const second = await extension.openOptions();
  await expect(editHere(first)).toBeVisible();
  await expect(second.getByText("My Rule Set 1")).toBeVisible();

  await second.getByRole("button", { name: "Add a Rule Set" }).click();
  await saveRule(second, "block", "/second");

  // Taking it back shows what the other page saved meanwhile
  await first.bringToFront();
  await editHere(first).click();
  await expect(editHere(second)).toBeVisible();
  await expect(first.getByText("My Rule Set 1")).toBeVisible();
  await expect(first.getByText("My Rule Set 2")).toBeVisible();

  // Closing the editing page lets the waiting one edit again
  await first.close();
  await expect(second.getByRole("button", { name: "Add a Rule Set" })).toBeVisible();
  await expect(editHere(second)).toBeHidden();
});
