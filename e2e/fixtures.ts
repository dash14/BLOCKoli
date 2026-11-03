import { createServer } from "node:http";
import { test as base, chromium, type BrowserContext, type Page } from "@playwright/test";
import { extensionPath } from "./paths";
import type { AddressInfo } from "node:net";

type Fixtures = {
  context: BrowserContext;
  extensionId: string;
  optionsPage: Page;
  /** Origin of a local server that answers every path with 200 */
  serverOrigin: string;
};

export const test = base.extend<Fixtures>({
  context: async ({ headless, locale }, provide) => {
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
    await provide(context);
    await context.close();
  },

  extensionId: async ({ context }, provide) => {
    const [worker] = context.serviceWorkers();
    const serviceWorker = worker ?? (await context.waitForEvent("serviceworker"));
    await provide(new URL(serviceWorker.url()).host);
  },

  optionsPage: async ({ context, extensionId }, provide) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/options.html`);
    await provide(page);
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
