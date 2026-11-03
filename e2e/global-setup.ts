import { existsSync } from "node:fs";
import { extensionPath } from "./paths";

export default function globalSetup() {
  if (!existsSync(`${extensionPath}/manifest.json`)) {
    throw new Error(`${extensionPath} has no build. Run \`pnpm build\` first.`);
  }
}
