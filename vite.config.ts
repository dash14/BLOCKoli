import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import zipPack from "vite-plugin-zip-pack";
import manifest from "./manifest.config";
import pkg from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react({
      jsxImportSource: "@emotion/react",
    }),
    crx({ manifest }),
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
