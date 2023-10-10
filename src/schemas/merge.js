import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import merge from "deepmerge"
import additional from "./additional.json" assert { type: "json" };
import draft from "./draft.json" assert { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schema = merge.all([draft, additional])
fs.writeFileSync(path.join(__dirname, "schema.json"), JSON.stringify(schema, null, 2))
