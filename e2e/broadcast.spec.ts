import {
  closeDialog,
  expect,
  expectBlocked,
  expectLoaded,
  saveRule,
  setRulesEnabled,
  test,
} from "./fixtures";
import type { Page } from "@playwright/test";

test("the popup and the options page show each other's changes", async ({
  extension,
  optionsPage: page,
}) => {
  const popup = await extension.openPopup();
  await expect(popup.getByText("No rules are defined.")).toBeVisible();
  const popupSwitch = popup.getByRole("checkbox", { name: "Enable rules" });

  await page.bringToFront();
  await page.getByRole("button", { name: "Add a Rule Set" }).click();
  await saveRule(page, "block", "/blocked");
  await expect(popupSwitch).toBeVisible();
  await expect(popupSwitch).not.toBeChecked();

  await setRulesEnabled(page, true);
  await expect(popupSwitch).toBeChecked();

  await popup.bringToFront();
  await setRulesEnabled(popup, false);
  await expect(page.getByRole("checkbox", { name: "Enable rules" })).not.toBeChecked();
});

test("options pages edit side by side without losing each other's changes or drafts", async ({
  extension,
  optionsPage: first,
  serverOrigin,
}) => {
  await first.getByRole("button", { name: "Add a Rule Set" }).click();
  await saveRule(first, "block", "/first");
  // A rule this page has not saved yet
  await first.getByRole("button", { name: "Add a Rule", exact: true }).click();
  await first.getByRole("textbox", { name: "URL Filter" }).fill("/draft");

  const second = await extension.openOptions();
  await expect(second.getByText("My Rule Set 1")).toBeVisible();
  await second.getByRole("button", { name: "Add a Rule Set" }).click();
  await saveRule(second, "block", "/second");

  await first.bringToFront();
  await expect(first.getByText("My Rule Set 2")).toBeVisible();
  await expect(first.getByRole("textbox", { name: "URL Filter" })).toHaveValue("/draft");
  await first.getByRole("button", { name: "Save" }).click();
  await expect(first.getByRole("button", { name: "Save" })).toBeHidden();

  await setRulesEnabled(first, true);
  for (const path of ["/first", "/draft", "/second"]) {
    await expectBlocked(first, `${serverOrigin}${path}`);
  }
});

test("refuses to save over a rule changed on another page, keeping the edit", async ({
  extension,
  optionsPage: first,
  serverOrigin,
}) => {
  await first.getByRole("button", { name: "Add a Rule Set" }).click();
  await saveRule(first, "block", "/saved");
  await editRule(first, "/first");

  const second = await extension.openOptions();
  await editRule(second, "/second");
  await second.getByRole("button", { name: "Save" }).click();
  await expect(second.getByRole("button", { name: "Save" })).toBeHidden();

  await first.bringToFront();
  await first.getByRole("button", { name: "Save" }).click();
  const dialog = first.getByRole("alertdialog");
  await expect(dialog).toContainText("It was changed in another tab");
  await closeDialog(first, dialog);
  const urlFilter = first.getByRole("textbox", { name: "URL Filter" });
  await expect(urlFilter).toHaveValue("/first");

  // Saving again overwrites the other page's change
  await first.getByRole("button", { name: "Save" }).click();
  await expect(urlFilter).toBeHidden();
  await setRulesEnabled(first, true);
  await expectBlocked(first, `${serverOrigin}/first`);
  await expectLoaded(first, `${serverOrigin}/second`);
});

/** Opens the only saved rule for editing and types a URL filter, without saving */
async function editRule(page: Page, urlFilter: string) {
  // The rule set title has an icon button of the same name
  await page.getByRole("button", { name: "Edit", exact: true }).filter({ hasText: "Edit" }).click();
  await page.getByRole("textbox", { name: "URL Filter" }).fill(urlFilter);
}
