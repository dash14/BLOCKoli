import { useEffect, useState } from "react";
import cloneDeep from "lodash-es/cloneDeep";
import { push, removeAt, replaceAt } from "@/modules/core/array";
import {
  RULE_ID_EDITING,
  Rule,
  RuleSet,
  RuleSets,
  newRuleSetTemplate,
} from "@/modules/core/rules";

export function useRuleSetsEdit(
  originalRuleSets: RuleSets,
  onChange: (ruleSets: RuleSets) => void
) {
  const [ruleSets, setRuleSets] = useState<RuleSets>(originalRuleSets);

  useEffect(() => {
    if (ruleSets.length === 0) {
      setRuleSets(originalRuleSets);
    } else {
      // merge editing
      setRuleSets(mergeEditingRuleSets(originalRuleSets, ruleSets));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalRuleSets]);

  function addRuleSet() {
    setRuleSets(push(ruleSets, cloneDeep(newRuleSetTemplate)));
  }

  function updateRules(rules: Rule[], ruleSetIndex: number) {
    if (rules.length === 0) {
      // add -> cancel
      setRuleSets(removeAt(ruleSets, ruleSetIndex));
    } else {
      const ruleSet = { ...ruleSets[ruleSetIndex], rules } as RuleSet;
      const newRuleSets = replaceAt(ruleSets, ruleSetIndex, ruleSet);
      setRuleSets(newRuleSets);
      onChange(filterAvailableRuleSets(newRuleSets)); // filter editing
    }
  }

  function removeRuleSet(index: number) {
    const ruleSet = ruleSets[index];
    if (ruleSet.rules.filter((r) => r.id !== RULE_ID_EDITING).length === 0) {
      // new rule set: same as cancel
      setRuleSets(removeAt(ruleSets, index));
    } else {
      const newRuleSets = removeAt(ruleSets, index);
      setRuleSets(newRuleSets);
      onChange(filterAvailableRuleSets(newRuleSets)); // filter editing
    }
  }

  function updateRuleSetTitle(title: string, index: number) {
    const ruleSet = { ...ruleSets[index], name: title } as RuleSet;
    const newRuleSets = replaceAt(ruleSets, index, ruleSet);
    setRuleSets(newRuleSets);
    onChange(filterAvailableRuleSets(newRuleSets)); // filter editing
  }

  return {
    ruleSets,
    addRuleSet,
    updateRules,
    removeRuleSet,
    updateRuleSetTitle,
  };
}

function filterAvailableRuleSets(ruleSets: RuleSets): RuleSets {
  return ruleSets
    .map((ruleSet) => {
      const rules = ruleSet.rules.filter((rule) => rule.id !== RULE_ID_EDITING);
      return { ...ruleSet, rules };
    })
    .filter((ruleSet) => ruleSet.rules.length > 0);
}

function mergeEditingRuleSets(
  filtered: RuleSets,
  ruleSets: RuleSets
): RuleSets {
  const newRuleSets = cloneDeep(filtered);
  ruleSets.forEach((ruleSet, ruleSetIndex) => {
    if (newRuleSets[ruleSetIndex]) {
      ruleSet.rules.forEach((rule, ruleIndex) => {
        if (rule.id === RULE_ID_EDITING) {
          newRuleSets[ruleSetIndex].rules.splice(ruleIndex, 0, rule);
        }
      });
    } else {
      newRuleSets[ruleSetIndex] = ruleSet;
    }
  });
  return newRuleSets;
}
