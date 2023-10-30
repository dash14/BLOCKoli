import cloneDeep from "lodash-es/cloneDeep";
import { RuleCondition } from "@/modules/core/rules";
import { ExportedRuleSets } from "@/modules/rules/export";
import { StoredRuleSets } from "@/modules/rules/stored";

export function performExportCommand(
  storedRuleSets: StoredRuleSets
): ExportedRuleSets {
  const ruleSets = storedRuleSets.map((ruleSet) => ({
    ...ruleSet,
    rules: ruleSet.rules.map((rule) => ({
      // remove 'id' field
      action: rule.action,
      condition: cleanupCondition(rule.condition),
    })),
  }));
  return {
    format: "BLOCKoli",
    version: 1,
    ruleSets,
  };
}

function cleanupCondition(condition: RuleCondition): RuleCondition {
  const results: RuleCondition = cloneDeep(condition);

  if (!results.initiatorDomains || results.initiatorDomains.length === 0) {
    delete results.initiatorDomains;
  }
  if (!results.requestDomains || results.requestDomains.length === 0) {
    delete results.requestDomains;
  }
  if (!results.requestMethods || results.requestMethods.length === 0) {
    delete results.requestMethods;
  }
  if (!results.resourceTypes || results.resourceTypes.length === 0) {
    delete results.resourceTypes;
  }
  if (!results.urlFilter) {
    delete results.urlFilter;
    delete results.isRegexFilter;
  }

  return results;
}
