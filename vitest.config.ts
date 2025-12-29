import react from "@vitejs/plugin-react-swc";
import { playwright } from "@vitest/browser-playwright";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react({
      jsxImportSource: "@emotion/react",
    }),
  ],
  test: {
    projects: [
      // Unit tests (既存テスト - Node環境)
      {
        extends: true,
        test: {
          name: "unit",
          include: ["src/**/*.test.ts"],
          exclude: ["src/**/*.browser.test.{ts,tsx}"],
          environment: "node",
        },
      },
      // Browser tests (新規 - ブラウザ環境)
      {
        extends: true,
        optimizeDeps: {
          include: ["react-icons/hi2"],
        },
        test: {
          name: "browser",
          include: ["src/**/*.browser.test.{ts,tsx}"],
          browser: {
            enabled: true,
            provider: playwright({
              contextOptions: {
                reducedMotion: "reduce",
              },
            }),
            instances: [{ browser: "chromium" }],
            headless: true,
          },
        },
      },
    ],
  },
});
