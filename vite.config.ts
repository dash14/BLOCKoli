import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import zipPack from "vite-plugin-zip-pack";
import manifest from "./manifest.config";
import pkg from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    crx({ manifest }),
    react({
      jsxImportSource: "@emotion/react",
    }),
    zipPack({
      inDir: "dist",
      outDir: ".",
      outFileName: `${pkg.name}_${pkg.version}.zip`,
    }),
  ],
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
    cors: {
      origin: [/chrome-extension:\/\//],
    },
  },
  optimizeDeps: {
    include: ["@chakra-ui/react", "loglevel", "loglevel-plugin-prefix"],
  },
});
