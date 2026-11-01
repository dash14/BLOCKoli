import { useEffect, useRef, useState } from "react";
import cloneDeep from "lodash-es/cloneDeep";
import { push, removeAt, replaceAt } from "@/modules/core/array";
import {
  RULE_ID_EDITING,
  StoredRule,
  StoredRuleSet,
  StoredRuleSets,
} from "@/modules/rules/stored";
import { newRuleSetTemplate } from "@/modules/rules/template";

export type RuleSetEntry = {
  // Stable across merges, for list rendering
  key: number;
  ruleSet: StoredRuleSet;
  // Whether its accordion starts open when it is first rendered
  open: boolean;
};

export function useRuleSetsEdit(
  originalRuleSets: StoredRuleSets,
  onChange: (ruleSets: StoredRuleSets) => void
) {
  const nextKey = useRef(1);
  const newKey = () => nextKey.current++;

  const [entries, setEntries] = useState<RuleSetEntry[]>(() =>
    mergeEntries(originalRuleSets, [], newKey)
  );
  const ruleSets = entries.map((entry) => entry.ruleSet);

  useEffect(() => {
    const merged = mergeEntries(originalRuleSets, entries, newKey);
    if (
      JSON.stringify(merged.map((entry) => entry.ruleSet)) !==
      JSON.stringify(ruleSets)
    ) {
      setEntries(merged);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalRuleSets]);

  function addRuleSet() {
    const newRuleSet = cloneDeep(newRuleSetTemplate);
    const nameWithNumPattern = new RegExp(`^${newRuleSet.name} (\\d+)`);

    const maxNumber = ruleSets.reduce((max, ruleSet) => {
      const result = nameWithNumPattern.exec(ruleSet.name);
      return result ? Math.max(max, parseInt(result[1], 10)) : max;
    }, 0);

    newRuleSet.name = `${newRuleSet.name} ${maxNumber + 1}`;

    setEntries(push(entries, { key: newKey(), ruleSet: newRuleSet, open: true }));
  }

  function replaceRuleSet(index: number, ruleSet: StoredRuleSet) {
    const newEntries = replaceAt(entries, index, { ...entries[index], ruleSet });
    setEntries(newEntries);
    onChange(filterAvailableRuleSets(newEntries)); // filter editing
  }

  function updateRules(rules: StoredRule[], ruleSetIndex: number) {
    if (rules.length === 0) {
      // add -> cancel
      setEntries(removeAt(entries, ruleSetIndex));
    } else {
      replaceRuleSet(ruleSetIndex, { ...entries[ruleSetIndex].ruleSet, rules });
    }
  }

  function removeRuleSet(ruleSetIndex: number) {
    const newEntries = removeAt(entries, ruleSetIndex);
    setEntries(newEntries);
    if (!isUnsaved(entries[ruleSetIndex])) {
      onChange(filterAvailableRuleSets(newEntries)); // filter editing
    }
  }

  function updateRuleSetTitle(title: string, index: number) {
    replaceRuleSet(index, { ...entries[index].ruleSet, name: title });
  }

  return {
    entries,
    ruleSets,
    addRuleSet,
    updateRules,
    removeRuleSet,
    updateRuleSetTitle,
  };
}

// A rule set added on this page whose first rule has not been saved yet
function isUnsaved(entry: RuleSetEntry): boolean {
  return entry.ruleSet.rules.every((rule) => rule.id === RULE_ID_EDITING);
}

function filterAvailableRuleSets(entries: RuleSetEntry[]): StoredRuleSets {
  return entries
    .map(({ ruleSet }) => {
      const rules = ruleSet.rules.filter((rule) => rule.id !== RULE_ID_EDITING);
      return { ...ruleSet, rules };
    })
    .filter((ruleSet) => ruleSet.rules.length > 0);
}

// Saved entries line up with the stored rule sets by position. Unsaved ones are
// not stored at all, so each stays after the saved entries that preceded it.
function mergeEntries(
  stored: StoredRuleSets,
  entries: RuleSetEntry[],
  newKey: () => number
): RuleSetEntry[] {
  const saved: RuleSetEntry[] = [];
  const unsaved: { entry: RuleSetEntry; savedBefore: number }[] = [];
  entries.forEach((entry) => {
    if (isUnsaved(entry)) {
      unsaved.push({ entry, savedBefore: saved.length });
    } else {
      saved.push(entry);
    }
  });
  const unsavedAt = (position: number) =>
    unsaved
      .filter(({ savedBefore }) => savedBefore === position)
      .map(({ entry }) => entry);

  // Open the only rule set when the list is first filled
  const openNew = entries.length === 0 && stored.length === 1;

  const merged = stored.flatMap((original, index) => {
    const ruleSet = cloneDeep(original);
    const previous = saved[index];
    // Keep the rules being added to this rule set
    previous?.ruleSet.rules.forEach((rule, ruleIndex) => {
      if (rule.id === RULE_ID_EDITING) {
        ruleSet.rules.splice(ruleIndex, 0, rule);
      }
    });
    const entry = previous
      ? { ...previous, ruleSet }
      : { key: newKey(), ruleSet, open: openNew };
    return [...unsavedAt(index), entry];
  });

  const trailing = unsaved
    .filter(({ savedBefore }) => savedBefore >= stored.length)
    .map(({ entry }) => entry);
  return [...merged, ...trailing];
}
