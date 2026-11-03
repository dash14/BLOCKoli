/// <reference types="chrome" />
import {
  expect,
  expectBlocked,
  expectLoaded,
  load,
  saveRule,
  setRulesEnabled,
  stopServiceWorker,
  test,
} from "./fixtures";

test("a new service worker applies the stored rules and answers the options page", async ({
  extension,
  optionsPage: page,
  serverOrigin,
}) => {
  await page.getByRole("button", { name: "Add a Rule Set" }).click();
  await saveRule(page, "block", "/blocked");
  await setRulesEnabled(page, true);
  await expectBlocked(page, `${serverOrigin}/blocked`);

  // Remove the dynamic rules behind the worker's back, so only a new worker
  // applying the stored rules can block the request again
  await extension.serviceWorker.evaluate(async () => {
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: rules.map((rule) => rule.id),
    });
  });
  await expectLoaded(page, `${serverOrigin}/blocked`);

  await stopServiceWorker(extension);
  // The reloaded page sends messages, which start a new worker. Reload again
  // if they reached the old worker before it stopped.
  await expect(async () => {
    await page.reload();
    await expect(load(page, `${serverOrigin}/blocked`)).rejects.toThrow(
      "net::ERR_BLOCKED_BY_CLIENT"
    );
  }).toPass();

  await setRulesEnabled(page, false);
  await expectLoaded(page, `${serverOrigin}/blocked`);
  await setRulesEnabled(page, true);
  await expectBlocked(page, `${serverOrigin}/blocked`);
});
