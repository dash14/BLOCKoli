import { expect, saveRule, setRulesEnabled, test } from "./fixtures";
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

test("only the options page opened last edits, and the others keep up with its saves", async ({
  extension,
  optionsPage: first,
}) => {
  const editHere = (page: Page) => page.getByRole("button", { name: "Edit in this tab" });
  const addRuleSet = (page: Page) => page.getByRole("button", { name: "Add a Rule Set" });

  await addRuleSet(first).click();
  await saveRule(first, "block", "/first");

  // A page opened later takes over the editing
  const second = await extension.openOptions();
  await expect(editHere(first)).toBeVisible();
  await expect(addRuleSet(first)).toBeHidden();
  await expect(second.getByText("My Rule Set 1")).toBeVisible();

  await addRuleSet(second).click();
  await saveRule(second, "block", "/second");

  // The waiting page still receives the saved rule sets, and shows them once
  // it edits again
  await first.bringToFront();
  await editHere(first).click();
  await expect(editHere(second)).toBeVisible();
  await expect(addRuleSet(second)).toBeHidden();
  await expect(first.getByText("My Rule Set 1")).toBeVisible();
  await expect(first.getByText("My Rule Set 2")).toBeVisible();

  // Closing the editing page lets the waiting one edit again
  await first.close();
  await expect(addRuleSet(second)).toBeVisible();
  await expect(editHere(second)).toBeHidden();
});
