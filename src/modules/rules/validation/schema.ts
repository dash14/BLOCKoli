import Ajv from "ajv";
import schema from "@/schemas/schema.json";

let ajv: Ajv | null = null;

function getAjv() {
  if (!ajv) {
    ajv = new Ajv({ allErrors: true });
    for (const [key, definition] of Object.entries(schema.definitions)) {
      if (key === "RuleSets") continue;
      ajv.addSchema(definition, `#/definitions/${key}`);
    }
  }
  return ajv;
}

export function createValidator(
  validationType: "RuleSet" | "RuleSets" | "Rule"
) {
  const ajv = getAjv();
  return ajv.compile(schema.definitions[validationType]);
}
