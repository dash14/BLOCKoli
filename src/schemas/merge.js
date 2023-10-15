import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import standaloneCode from "ajv/dist/standalone/index.js";
import merge from "deepmerge";
import additional from "./additional.json" assert { type: "json" };
import draft from "./draft.json" assert { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const merged = merge.all([draft, additional]);
fs.writeFileSync(
  path.join(__dirname, "schema.json"),
  JSON.stringify(merged, null, 2)
);

// output esm code
const schema = merged["$schema"];
const schemas = Object.entries(merged.definitions).map(([id, def]) => ({
  $schema: schema,
  $id: `#/definitions/${id}`,
  ...def,
}));
const ajv = new Ajv({ schemas, allErrors: true, code: { source: true, esm: true } });
let moduleCode = standaloneCode(ajv, {
  Rule: "#/definitions/Rule",
  RuleSet: "#/definitions/RuleSet",
  RuleSets: "#/definitions/RuleSets",
});

// Fixed to be truly ESM-compatible
// https://github.com/ajv-validator/ajv/issues/2209
moduleCode = moduleCode.replace(
  `const func2 = require("ajv/dist/runtime/ucs2length").default`,
  `import func2 from "ajv/dist/runtime/ucs2length"`
)

// Now you can write the module code to file
fs.writeFileSync(path.join(__dirname, "validate.mjs"), moduleCode);
