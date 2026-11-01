import { RegexValidator } from "@/modules/core/regex";
import { RuleSets } from "@/modules/core/rules";
import { ExportedRuleSets } from "@/modules/rules/export";
import {
  RULE_ID_UNSAVED,
  StoredRuleSet,
  StoredRuleSets,
} from "@/modules/rules/stored";
import {
  RuleSetsValidationError,
  validateRuleSets,
} from "@/modules/rules/validation/RuleSets";
import { validateRegexSupport } from "@/modules/rules/validation/edit";

export async function performImportCommand(
  object: object,
  storedRuleSets: StoredRuleSets,
  regexValidator: RegexValidator
): Promise<[boolean, RuleSetsValidationError[], StoredRuleSets]> {
  // validate meta data in JSON
  const [valid, errors, data] = validateImportObject(object);
  if (!valid) {
    return [false, errors, []];
  }

  // validate rule sets in JSON
  const result = validateRuleSets(data.ruleSets);
  if (!result.valid) {
    return [false, result.errors, []];
  }

  const regexErrors = await validateRegexFilters(
    result.evaluated,
    regexValidator
  );
  if (regexErrors.length > 0) {
    return [false, regexErrors, []];
  }

  // registration
  const evaluatedRuleSets = result.evaluated;
  for (const ruleSet of evaluatedRuleSets) {
    const newRuleSet: StoredRuleSet = {
      name: ruleSet.name,
      rules: ruleSet.rules.map((r) => ({ ...r, id: RULE_ID_UNSAVED })),
    };
    const existsIndex = storedRuleSets.findIndex(
      (r) => r.name === ruleSet.name
    );
    if (existsIndex >= 0) {
      storedRuleSets[existsIndex] = newRuleSet;
    } else {
      storedRuleSets.push(newRuleSet);
    }
  }

  return [true, [], storedRuleSets];
}

async function validateRegexFilters(
  ruleSets: RuleSets,
  regexValidator: RegexValidator
): Promise<RuleSetsValidationError[]> {
  const checks = ruleSets.flatMap((ruleSet, ruleSetNumber) =>
    ruleSet.rules.map(async (rule, ruleNumber) => {
      const error = await validateRegexSupport(rule, regexValidator);
      return (
        error && { ruleSetNumber, ruleSetField: "rules", ruleNumber, ...error }
      );
    })
  );
  const errors = await Promise.all(checks);
  return errors.filter((e) => e !== undefined);
}

function validateImportObject(
  object: object
): [true, [], ExportedRuleSets] | [false, RuleSetsValidationError[], []] {
  const errors: RuleSetsValidationError[] = [];
  // format check
  const data = object as ExportedRuleSets;
  if (!data.format || data.format !== "BLOCKoli") {
    errors.push({
      message:
        "The format is incorrect, please specify what was exported by BLOCKoli",
    });
    return [false, errors, []];
  }

  if (!data.version || data.version !== 1) {
    errors.push({
      message: "The file format version is not supported",
    });
    return [false, errors, []];
  }

  return [true, [], data];
}
