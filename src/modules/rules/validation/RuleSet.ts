import { RuleSet } from "@/modules/core/rules";
import { uniqueObjects } from "@/modules/utils/unique";
import {
  RuleInstancePath,
  RuleValidationError,
  replaceErrorMessages,
  parseRuleInstancePath,
  validateWithoutSchema,
} from "./Rule";
import { createValidator } from "./schema";

// ------------------------------------
// Types
// ------------------------------------

// Validation for RuleSet
export interface RuleSetValidationError extends RuleValidationError {
  ruleSetField?: string;
  ruleNumber?: number;
}

export type RuleSetValidationResult =
  | {
      valid: true;
      evaluated: RuleSet;
    }
  | {
      valid: false;
      errors: RuleSetValidationError[];
    };

export interface RuleSetInstancePath extends RuleInstancePath {
  ruleSetField?: string | undefined;
  ruleNumber?: number | undefined;
}

// ------------------------------------
// Functions
// ------------------------------------

export function validateRuleSet(json: object): RuleSetValidationResult {
  const validate = createValidator("RuleSet");
  const valid = validate(json);

  if (valid) {
    const evaluated = json as unknown as RuleSet;
    const [valid, errors] = validateWithoutSchemaInRuleSet(evaluated);
    if (valid) {
      return { valid: true, evaluated };
    } else {
      return { valid: false, errors };
    }
  } else {
    const errors: RuleSetValidationError[] =
      validate.errors?.map((err) => {
        return {
          ...parseInstancePath(err.instancePath),
          message: err.message,
        };
      }) ?? [];
    return {
      valid: false,
      errors: replaceErrorMessages(uniqueObjects(errors)),
    };
  }
}

export function validateWithoutSchemaInRuleSet(
  ruleSet: RuleSet
): [boolean, RuleSetValidationError[]] {
  const errors: RuleSetValidationError[] = [];
  ruleSet.rules.forEach((rule, i) => {
    const result = validateWithoutSchema(rule);
    if (!result.valid) {
      for (const error of result.errors) {
        errors.push({
          ruleSetField: "rules",
          ruleNumber: i,
          ...error,
        });
      }
    }
  });
  return [errors.length === 0, errors];
}

export function parseRuleSetInstancePath(paths: string[]): RuleSetInstancePath {
  // path is like: ["rules", "0", "condition"]
  let nextItem = paths.shift();
  if (nextItem === undefined) return {};

  const ruleSetField = nextItem;

  nextItem = paths.shift();
  if (nextItem === undefined) {
    return { ruleSetField };
  }

  const ruleNumber = parseInt(nextItem, 10);
  if (!isFinite(ruleNumber)) {
    return { ruleSetField };
  }

  return {
    ruleSetField,
    ruleNumber,
    ...parseRuleInstancePath(paths),
  };
}

// ------------------------------------
// Local functions
// ------------------------------------

function parseInstancePath(path: string): RuleSetInstancePath {
  // path is like: "rules/0/condition"
  const paths = path.split("/");
  paths.shift();

  return parseRuleSetInstancePath(paths);
}
