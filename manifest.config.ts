import { defineManifest } from "@crxjs/vite-plugin";
import packageJson from "./package.json";
const { version } = packageJson;

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch, label = "0"] = version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, "")
  // split into version parts
  .split(/[.-]/);

export default defineManifest(async (env) => ({
  manifest_version: 3,
  name: env.mode === "staging" ? "[INTERNAL] BLOCKoli" : "BLOCKoli",
  version: `${major}.${minor}.${patch}.${label}`,
  version_name: version,
  default_locale: "en",
  background: {
    service_worker: "src/background.ts",
    type: "module",
  },
  action: {
    default_popup: "popup.html",
    default_icon: "images/icon16-gray.png",
  },
  options_page: "options.html",
  permissions: ["declarativeNetRequest", "activeTab", "storage"],
  icons: {
    16: "images/icon16.png",
    48: "images/icon48.png",
    128: "images/icon128.png",
  },
}));
