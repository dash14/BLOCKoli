import { RuleSets } from "@/modules/core/rules";
import { uniqueObjects } from "@/modules/utils/unique";
import {
  RuleSetInstancePath,
  RuleSetValidationError,
  parseRuleSetInstancePath,
  replaceErrorMessages,
  validateContainAtLeastOneRule,
} from "./RuleSet";
import { createValidator } from "./schema";

// ------------------------------------
// Types
// ------------------------------------

interface RuleSetsValidationError extends RuleSetValidationError {
  ruleSetNumber?: number;
}

export type RuleSetsValidationResult =
  | {
      valid: true;
      evaluated: RuleSets;
    }
  | {
      valid: false;
      errors: RuleSetsValidationError[];
    };

interface RuleSetsInstancePath extends RuleSetInstancePath {
  ruleSetNumber?: number | undefined;
}

// ------------------------------------
// Exported functions
// ------------------------------------

export function validateRuleSets(json: object): RuleSetsValidationResult {
  const validate = createValidator("RuleSets");
  const valid = validate(json);

  if (valid) {
    const evaluated = json as unknown as RuleSets;
    const errors = evaluated
      .map((ruleSet, i) => {
        const [valid, ruleSetErrors] = validateContainAtLeastOneRule(ruleSet);
        if (valid) {
          return true;
        } else {
          return {
            ruleSetNumber: i,
            ...ruleSetErrors,
          };
        }
      })
      .filter((v) => v !== true) as RuleSetsValidationError[];

    if (errors.length === 0) {
      return { valid: true, evaluated };
    } else {
      return { valid: false, errors };
    }
  } else {
    const errors: RuleSetsValidationError[] =
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

// ------------------------------------
// Local functions
// ------------------------------------

function parseInstancePath(path: string): RuleSetsInstancePath {
  // path is like: "/0/rules/0/condition"
  const paths = path.split("/");
  paths.shift();
  const nextItem = paths.shift();
  if (nextItem === undefined) return {};

  const ruleSetNumber = parseInt(nextItem, 10);
  if (!isFinite(ruleSetNumber)) {
    return {};
  }

  return {
    ruleSetNumber,
    ...parseRuleSetInstancePath("/" + paths.join("/")),
  };
}
