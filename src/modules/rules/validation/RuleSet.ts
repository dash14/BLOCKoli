import { RuleSet } from "@/modules/core/rules";
import { uniqueObjects } from "@/modules/utils/unique";
import { createValidator } from "./schema";

// ------------------------------------
// Types
// ------------------------------------

// Validation for RuleSet
export interface RuleSetValidationError {
  ruleSetField?: string;
  ruleNumber?: number;
  ruleField?: string;
  message?: string;
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

export interface RuleSetInstancePath {
  ruleSetField?: string | undefined;
  ruleNumber?: number | undefined;
  ruleField?: string | undefined;
}

// ------------------------------------
// Functions
// ------------------------------------

export function validateRuleSet(json: object): RuleSetValidationResult {
  const validate = createValidator("RuleSet");
  const valid = validate(json);

  if (valid) {
    const evaluated = json as unknown as RuleSet;
    const [valid, errors] = validateContainAtLeastOneRule(evaluated);
    if (valid) {
      return { valid: true, evaluated };
    } else {
      return { valid: false, errors };
    }
  } else {
    const errors: RuleSetValidationError[] =
      validate.errors?.map((err) => {
        return {
          ...parseRuleSetInstancePath(err.instancePath),
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
  ruleSet: RuleSet
): [boolean, RuleSetValidationError[]] {
  const errors: RuleSetValidationError[] = [];
  ruleSet.rules.forEach((rule, i) => {
    if (Object.keys(rule.condition).length === 0) {
      errors.push({
        ruleSetField: "rules",
        ruleNumber: i,
        ruleField: "condition",
        message: "must contain at least one rule",
      });
    }
  });
  return [errors.length === 0, errors];
}

export function parseRuleSetInstancePath(path: string): RuleSetInstancePath {
  // path is like: "/rules/0/condition"
  const paths = path.split("/");
  paths.shift();
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

  const ruleField = paths.shift();
  if (ruleField === undefined) {
    return { ruleSetField, ruleNumber };
  }

  const ruleField2 = paths.shift();
  if (ruleField2) {
    return {
      ruleSetField,
      ruleNumber,
      ruleField: `${ruleField}.${ruleField2}`,
    };
  } else {
    return {
      ruleSetField,
      ruleNumber,
      ruleField,
    };
  }
}

export function replaceErrorMessages(errors: RuleSetValidationError[]) {
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
    'must match pattern "^[ -~]+$"': "must not contain non-ascii code",
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
