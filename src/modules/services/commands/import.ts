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
  object: unknown,
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

  // The n-th rule set of a name replaces the n-th stored one of that name; the rest are appended.
  const storedIndexes = new Map<string, number[]>();
  storedRuleSets.forEach(({ name }, index) => {
    const indexes = storedIndexes.get(name);
    if (indexes) indexes.push(index);
    else storedIndexes.set(name, [index]);
  });
  for (const ruleSet of result.evaluated) {
    const newRuleSet: StoredRuleSet = {
      name: ruleSet.name,
      rules: ruleSet.rules.map((r) => ({ ...r, id: RULE_ID_UNSAVED })),
    };
    const existsIndex = storedIndexes.get(ruleSet.name)?.shift();
    if (existsIndex !== undefined) {
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
  object: unknown
): [true, [], ExportedRuleSets] | [false, RuleSetsValidationError[], []] {
  const errors: RuleSetsValidationError[] = [];
  // format check
  if (
    typeof object !== "object" ||
    object === null ||
    !("format" in object) ||
    object.format !== "BLOCKoli"
  ) {
    errors.push({
      message:
        "The format is incorrect, please specify what was exported by BLOCKoli",
    });
    return [false, errors, []];
  }

  const data = object as ExportedRuleSets;
  if (!data.version || data.version !== 1) {
    errors.push({
      message: "The file format version is not supported",
    });
    return [false, errors, []];
  }

  return [true, [], data];
}
