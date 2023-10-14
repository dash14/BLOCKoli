import { Rule } from "@/modules/core/rules";
import { uniqueObjects } from "@/modules/utils/unique";
import { createValidator } from "./schema";

// ------------------------------------
// Types
// ------------------------------------

// Validation for Rule
export interface RuleValidationError {
  ruleField?: string;
  message?: string;
}

export type RuleValidationResult =
  | {
      valid: true;
      evaluated: Rule;
    }
  | {
      valid: false;
      errors: RuleValidationError[];
    };

export interface RuleInstancePath {
  ruleField?: string | undefined;
}

// ------------------------------------
// Functions
// ------------------------------------

export function validateRule(json: object): RuleValidationResult {
  const validate = createValidator("Rule");
  const valid = validate(json);

  if (valid) {
    const evaluated = json as unknown as Rule;
    const [valid, error] = validateContainAtLeastOneRule(evaluated);
    if (valid) {
      return { valid: true, evaluated };
    } else {
      return { valid: false, errors: [error] };
    }
  } else {
    const errors: RuleValidationError[] =
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

export function validateContainAtLeastOneRule(
  rule: Rule
): [true, undefined] | [false, RuleValidationError] {
  if (Object.keys(rule.condition).length === 0) {
    return [
      false,
      {
        ruleField: "condition",
        message: "must contain at least one rule",
      },
    ];
  }
  return [true, undefined];
}

export function parseRuleInstancePath(paths: string[]): RuleInstancePath {
  // paths is like: ["condition, "initialDomains"]
  const ruleField = paths.shift();
  if (!ruleField) {
    return {};
  }

  const ruleField2 = paths.shift();
  if (ruleField2) {
    return {
      ruleField: `${ruleField}.${ruleField2}`,
    };
  } else {
    return { ruleField };
  }
}

export function replaceErrorMessages(errors: RuleValidationError[]) {
  const replacesForAction: Record<string, string> = {
    "must be equal to one of the allowed values":
      "must be either 'block' or 'allow'",
  };
  const replacesForConditions: Record<string, string> = {
    "must match a schema in anyOf": "must have one or more valid condition",
    "must have required property 'requestDomains'":
      "should have required property 'requestDomains'",
    "must have required property 'initiatorDomains'":
      "should have required property 'initiatorDomains'",
    "must have required property 'urlFilter'":
      "should have required property 'urlFilter'",
    "must have required property 'requestMethods'":
      "should have required property 'requestMethods'",
    "must have required property 'resourceTypes'":
      "should have required property 'resourceTypes'",
    'must match pattern "^[!-~]+$"':
      "must not contain non-ascii code and space",
    'must match pattern "^[ -~]*$"': "must not contain non-ascii code",
  };
  const actionKeys = Object.keys(replacesForAction);
  const conditionKeys = Object.keys(replacesForConditions);
  return errors.map((error) => {
    if (
      error.ruleField?.startsWith("action") &&
      error.message &&
      actionKeys.includes(error.message)
    ) {
      return {
        ...error,
        message: replacesForAction[error.message],
      };
    } else if (
      error.ruleField?.startsWith("condition") &&
      error.message &&
      conditionKeys.includes(error.message)
    ) {
      return {
        ...error,
        message: replacesForConditions[error.message],
      };
    } else {
      return error;
    }
  });
}

// ------------------------------------
// Local functions
// ------------------------------------

function parseInstancePath(path: string): RuleInstancePath {
  // path is like: "/condition/initialDomains"
  const paths = path.split("/");
  paths.shift();

  return parseRuleInstancePath(paths);
}
