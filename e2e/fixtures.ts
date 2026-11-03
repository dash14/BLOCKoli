import { createServer } from "node:http";
import {
  test as base,
  chromium,
  type BrowserContext,
  type Locator,
  type Page,
  type Worker,
} from "@playwright/test";
import { extensionPath } from "./paths";
import type { AddressInfo } from "node:net";

/** A browser with its own new profile and the extension loaded */
export type ExtensionBrowser = {
  context: BrowserContext;
  extensionId: string;
  serviceWorker: Worker;
  /** The options page, opened in a new tab */
  openOptions: () => Promise<Page>;
  /** The popup, opened in a new tab */
  openPopup: () => Promise<Page>;
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

      const openInFront = async (url: string) => {
        const page = await context.newPage();
        await page.goto(url);
        await page.bringToFront();
        return page;
      };
      const openOptions = () => openInFront(optionsUrl);
      const openPopup = () => openInFront(`chrome-extension://${extensionId}/popup.html`);
      return { context, extensionId, serviceWorker, openOptions, openPopup };
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

/**
 * Stops the extension's service worker. Chrome starts a new one on the next
 * event, such as a message from a page.
 */
export async function stopServiceWorker({ context, extensionId }: ExtensionBrowser) {
  const session = await context.browser()!.newBrowserCDPSession();
  try {
    const { targetInfos } = await session.send("Target.getTargets");
    const workers = targetInfos.filter(
      (target) =>
        target.type === "service_worker" &&
        target.url.startsWith(`chrome-extension://${extensionId}/`)
    );
    if (workers.length === 0) {
      throw new Error(`No service worker found for ${extensionId}`);
    }
    for (const worker of workers) {
      await session.send("Target.closeTarget", { targetId: worker.targetId });
    }
  } finally {
    await session.detach();
  }
}

/** Checks or unchecks a Chakra checkbox, switch or radio */
export async function setChecked(control: Locator, checked: boolean) {
  await expect(control).toBeEnabled();
  if ((await control.isChecked()) !== checked) {
    // Chakra covers the hidden input with its visible control
    await control.dispatchEvent("click");
  }
  await expect(control).toBeChecked({ checked });
}

/** Turns the rules on or off from the options page or the popup */
export async function setRulesEnabled(page: Page, enabled: boolean) {
  await setChecked(page.getByRole("checkbox", { name: "Enable rules" }), enabled);
}

/** Adds a rule to the rule set being edited, and saves it */
export async function saveRule(page: Page, action: "block" | "allow", urlFilter: string) {
  await setChecked(page.getByRole("radio", { name: action }), true);
  await page.getByRole("textbox", { name: "URL Filter" }).fill(urlFilter);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("button", { name: "Save" })).toBeHidden();
}

/** An exported file holding the given rule sets */
export function exportedFile(...ruleSets: { name: string; rules: object[] }[]) {
  const content = { format: "BLOCKoli", version: 1, ruleSets };
  return {
    name: "rules.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(content)),
  };
}

/**
 * Imports a file from the options page, and returns the dialog that reports
 * whether the import succeeded
 */
export async function importRules(
  page: Page,
  file: Parameters<Locator["setInputFiles"]>[0]
) {
  await page.getByRole("button", { name: "Import and Export Rules" }).click();
  await page.getByLabel("Import rules").setInputFiles(file);
  await page.getByRole("button", { name: "Import", exact: true }).click();
  const result = page
    .getByRole("alertdialog")
    .filter({ hasText: /Import (succeeded|failed)/ });
  await expect(result).toBeVisible();
  return result;
}

/** Imports a file that must fail with the reason, and checks the stored rule sets are still empty */
export async function expectImportFailed(
  page: Page,
  file: Parameters<Locator["setInputFiles"]>[0],
  reason: string
) {
  const result = await importRules(page, file);
  await expect(result).toContainText("Import failed");
  await expect(result).toContainText(reason);
  await closeDialog(page, result);
  // Read the rule sets from storage again, rather than what the page holds
  await page.reload();
  await expect(page.getByText("There are no rule sets available.")).toBeVisible();
}

/** Closes a dialog with its Close button, and waits until no dialog is left */
export async function closeDialog(page: Page, dialog: Locator) {
  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
}

/** Waits until Chrome blocks the URL, as it applies dynamic rules asynchronously */
export async function expectBlocked(page: Page, url: string) {
  await expect(async () => {
    await expect(load(page, url)).rejects.toThrow("net::ERR_BLOCKED_BY_CLIENT");
  }).toPass();
}

/** Waits until the URL loads, as Chrome removes dynamic rules asynchronously */
export async function expectLoaded(page: Page, url: string) {
  await expect(async () => {
    expect((await load(page, url))?.ok()).toBe(true);
  }).toPass();
}
