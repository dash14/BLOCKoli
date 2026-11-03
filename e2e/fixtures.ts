import { createServer } from "node:http";
import { test as base, chromium, type BrowserContext, type Page } from "@playwright/test";
import { extensionPath } from "./paths";
import type { AddressInfo } from "node:net";

/** A browser with its own new profile and the extension loaded */
export type ExtensionBrowser = {
  context: BrowserContext;
  extensionId: string;
  /** The options page, opened in a new tab */
  openOptions: () => Promise<Page>;
};

type Fixtures = {
  /** Launches another browser, closed when the test ends */
  launchBrowser: () => Promise<ExtensionBrowser>;
  /** The first browser, which most tests use */
  extension: ExtensionBrowser;
  optionsPage: Page;
  /** Origin of a local server that answers every path with 200 */
  serverOrigin: string;
};

export const test = base.extend<Fixtures>({
  launchBrowser: async ({ headless, locale }, provide) => {
    const contexts: BrowserContext[] = [];
    await provide(async () => {
      const context = await chromium.launchPersistentContext("", {
        // The new headless mode of full Chromium, which can load extensions
        channel: "chromium",
        headless,
        locale,
        args: [
          `--disable-extensions-except=${extensionPath}`,
          `--load-extension=${extensionPath}`,
        ],
      });
      contexts.push(context);
      const [worker] = context.serviceWorkers();
      const serviceWorker = worker ?? (await context.waitForEvent("serviceworker"));
      const extensionId = new URL(serviceWorker.url()).host;
      const optionsUrl = `chrome-extension://${extensionId}/options.html`;

      // The extension opens the options page on install. Close it so that it
      // cannot come to the front later, where a background tab never gets
      // stable for clicks.
      let installTab: Page | undefined;
      await expect
        .poll(() => (installTab = context.pages().find((p) => p.url() === optionsUrl)))
        .toBeDefined();
      await installTab?.close();

      const openOptions = async () => {
        const page = await context.newPage();
        await page.goto(optionsUrl);
        await page.bringToFront();
        return page;
      };
      return { context, extensionId, openOptions };
    });
    await Promise.allSettled(contexts.map((context) => context.close()));
  },

  extension: async ({ launchBrowser }, provide) => {
    await provide(await launchBrowser());
  },

  optionsPage: async ({ extension }, provide) => {
    await provide(await extension.openOptions());
  },

  // eslint-disable-next-line no-empty-pattern -- Playwright requires a destructured first argument
  serverOrigin: async ({}, provide) => {
    const server = createServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("ok");
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address() as AddressInfo;
    await provide(`http://127.0.0.1:${port}`);
    // The browser is still open here and keeps its connections alive
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  },
});

export const expect = test.expect;

/**
 * Loads the URL in a new tab, as a blocked load still moves its tab to
 * Chrome's error page, then brings `page` back to the front
 */
export async function load(page: Page, url: string) {
  const tab = await page.context().newPage();
  try {
    return await tab.goto(url);
  } finally {
    await tab.close();
    await page.bringToFront();
  }
}

/** Turns the rules on or off from the options page */
export async function setRulesEnabled(page: Page, enabled: boolean) {
  const rulesSwitch = page.getByRole("checkbox", { name: "Enable rules" });
  await expect(rulesSwitch).toBeEnabled();
  if ((await rulesSwitch.isChecked()) !== enabled) {
    // Chakra covers the switch's hidden input with its visible control
    await rulesSwitch.dispatchEvent("click");
  }
  await expect(rulesSwitch).toBeChecked({ checked: enabled });
}

/** Adds a rule to the rule set being edited, and saves it */
export async function saveRule(page: Page, action: "block" | "allow", urlFilter: string) {
  const actionRadio = page.getByRole("radio", { name: action });
  // Chakra covers the radio's hidden input with its visible control
  await actionRadio.dispatchEvent("click");
  await expect(actionRadio).toBeChecked();
  await page.getByRole("textbox", { name: "URL Filter" }).fill(urlFilter);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("button", { name: "Save" })).toBeHidden();
}

/** Waits until Chrome blocks the URL, as it applies dynamic rules asynchronously */
export async function expectBlocked(page: Page, url: string) {
  await expect(async () => {
    await expect(load(page, url)).rejects.toThrow("net::ERR_BLOCKED_BY_CLIENT");
  }).toPass();
}

export async function expectLoaded(page: Page, url: string) {
  expect((await load(page, url))?.ok()).toBe(true);
}
