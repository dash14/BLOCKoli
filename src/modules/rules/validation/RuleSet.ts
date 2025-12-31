import { RuleSet } from "@/modules/core/rules";
import { uniqueObjects } from "@/modules/utils/unique";
import {
  RuleInstancePath,
  RuleValidationError,
  replaceErrorMessages,
  parseRuleInstancePath,
  validateWithoutSchema as validateRuleWithoutSchema,
  combineValidationResult,
  validateAdditional as validateRuleAdditional,
  ValidationResult,
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
  const [valid, errors] = combineValidationResult<RuleSetValidationError>(
    validateWithSchema(json),
    validateWithoutSchema(json)
  );
  errors?.sort((a, b) => {
    if (a.ruleNumber === b.ruleNumber) {
      return 0;
    } else {
      return (a.ruleNumber ?? 0) - (b.ruleNumber ?? 0);
    }
  });

  if (valid) {
    const evaluated = json as unknown as RuleSet;
    const [valid, errors] = validateAdditional(evaluated);
    return valid ? { valid, evaluated } : { valid, errors };
  } else {
    return { valid, errors };
  }
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

function parseRuleSetInstancePath(paths: string[]): RuleSetInstancePath {
  // path is like: ["rules", "0", "condition"]
  let nextItem = paths.shift();
  if (nextItem === undefined) return {};

  const ruleSetField = nextItem;

  nextItem = paths.shift();
  if (nextItem === undefined) {
    return { ruleSetField };
  }

  const ruleNumber = parseInt(nextItem, 10);
  /* v8 ignore if -- @preserve */
  if (!isFinite(ruleNumber)) {
    return { ruleSetField };
  }

  return {
    ruleSetField,
    ruleNumber,
    ...parseRuleInstancePath(paths),
  };
}

function validateWithSchema(
  json: object
): ValidationResult<RuleSetValidationError> {
  const validate = createValidator("RuleSet");
  const valid = validate(json);

  if (valid) {
    return [valid, undefined];
  } else {
    const errors: RuleSetValidationError[] =
      validate.errors?.map((err) => {
        return {
          ...parseInstancePath(err.instancePath),
          message: err.message,
        };
      }) ?? [];
    return [valid, replaceErrorMessages(uniqueObjects(errors))];
  }
}

function validateWithoutSchema(
  json: object
): ValidationResult<RuleSetValidationError> {
  const errors: RuleSetValidationError[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ruleSet = json as any;
  const rules = ruleSet?.rules;
  if (!(rules instanceof Array)) {
    return [false, []]; // delegate validation with schema
  }
  rules.forEach((rule: object, i: number) => {
    const [resultValid, resultErrors] = validateRuleWithoutSchema(rule);
    if (!resultValid) {
      for (const error of resultErrors) {
        errors.push({
          ruleSetField: "rules",
          ruleNumber: i,
          ...error,
        });
      }
    }
  });
  return errors.length === 0 ? [true, undefined] : [false, errors];
}

function validateAdditional(
  ruleSet: RuleSet
): ValidationResult<RuleSetValidationError> {
  const errors: RuleSetValidationError[] = [];
  ruleSet.rules.forEach((rule, i) => {
    const [resultValid, resultErrors] = validateRuleAdditional(rule);
    if (!resultValid) {
      for (const error of resultErrors) {
        errors.push({
          ruleSetField: "rules",
          ruleNumber: i,
          ...error,
        });
      }
    }
  });
  return errors.length === 0 ? [true, undefined] : [false, errors];
}
