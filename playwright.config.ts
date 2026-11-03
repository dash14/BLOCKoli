import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  globalSetup: "./e2e/global-setup.ts",
  forbidOnly: !!process.env.CI,
  // Each test launches its own browser with the extension loaded
  fullyParallel: true,
  reporter: "list",
  use: {
    locale: "en-US",
    trace: "retain-on-failure",
  },
});
