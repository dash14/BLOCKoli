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
  /** The browser most tests need */
  extension: ExtensionBrowser;
  context: BrowserContext;
  extensionId: string;
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
      const openOptions = async () => {
        const page = await context.newPage();
        await page.goto(`chrome-extension://${extensionId}/options.html`);
        return page;
      };
      return { context, extensionId, openOptions };
    });
    await Promise.all(contexts.map((context) => context.close()));
  },

  extension: async ({ launchBrowser }, provide) => {
    await provide(await launchBrowser());
  },

  context: async ({ extension }, provide) => {
    await provide(extension.context);
  },

  extensionId: async ({ extension }, provide) => {
    await provide(extension.extensionId);
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

// A new tab per load, as a blocked load still moves its tab to Chrome's error page
export async function load(context: BrowserContext, url: string) {
  const page = await context.newPage();
  try {
    return await page.goto(url);
  } finally {
    await page.close();
  }
}

/** Turns the rules on from the options page */
export async function enableRules(page: Page) {
  const enableRules = page.getByRole("checkbox", { name: "Enable rules" });
  // Chakra covers the switch's hidden input with its visible control
  await enableRules.dispatchEvent("click");
  await expect(enableRules).toBeChecked();
}

/** Waits until Chrome blocks the URL, as it applies dynamic rules asynchronously */
export async function expectBlocked(context: BrowserContext, url: string) {
  await expect(async () => {
    await expect(load(context, url)).rejects.toThrow("net::ERR_BLOCKED_BY_CLIENT");
  }).toPass();
}

export async function expectLoaded(context: BrowserContext, url: string) {
  expect((await load(context, url))?.ok()).toBe(true);
}
