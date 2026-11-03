import { expect, test } from "./fixtures";
import type { BrowserContext } from "@playwright/test";

// A new tab per load, as a blocked load still moves its tab to Chrome's error page
async function load(context: BrowserContext, url: string) {
  const page = await context.newPage();
  try {
    return await page.goto(url);
  } finally {
    await page.close();
  }
}

test("blocks requests that match a saved rule only while rules are enabled", async ({
  context,
  optionsPage: page,
  serverOrigin,
}) => {
  await page.getByRole("button", { name: "Add a Rule Set" }).click();
  await page.getByRole("textbox", { name: "URL Filter" }).fill("/blocked");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("button", { name: "Save" })).toBeHidden();

  const enableRules = page.getByRole("checkbox", { name: "Enable rules" });
  // Chakra covers the switch's hidden input with its visible control
  await enableRules.check({ force: true });
  await expect(enableRules).toBeChecked();

  // Chrome applies the dynamic rules asynchronously
  await expect(async () => {
    await expect(load(context, `${serverOrigin}/blocked`)).rejects.toThrow(
      "net::ERR_BLOCKED_BY_CLIENT"
    );
  }).toPass();
  expect((await load(context, `${serverOrigin}/allowed`))?.ok()).toBe(true);

  await enableRules.uncheck({ force: true });
  await expect(enableRules).not.toBeChecked();
  await expect(async () => {
    expect((await load(context, `${serverOrigin}/blocked`))?.ok()).toBe(true);
  }).toPass();
});
