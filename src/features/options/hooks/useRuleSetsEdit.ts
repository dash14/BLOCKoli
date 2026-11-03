import { useEffect, useState } from "react";
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
  ruleSet: StoredRuleSet;
  // Whether its accordion starts open when it is first rendered
  open: boolean;
};

export function useRuleSetsEdit(
  originalRuleSets: StoredRuleSets,
  onChange: (ruleSets: StoredRuleSets) => void
) {
  const [entries, setEntries] = useState<RuleSetEntry[]>(() =>
    mergeEntries(originalRuleSets, [])
  );
  const ruleSets = entries.map((entry) => entry.ruleSet);

  useEffect(() => {
    const merged = mergeEntries(originalRuleSets, entries);
    if (
      JSON.stringify(merged.map((entry) => entry.ruleSet)) !==
      JSON.stringify(ruleSets)
    ) {
      setEntries(merged);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalRuleSets]);

  function addRuleSet() {
    const newRuleSet = {
      ...cloneDeep(newRuleSetTemplate),
      id: crypto.randomUUID(),
    };
    const nameWithNumPattern = new RegExp(`^${newRuleSet.name} (\\d+)`);

    const maxNumber = ruleSets.reduce((max, ruleSet) => {
      const result = nameWithNumPattern.exec(ruleSet.name);
      return result ? Math.max(max, parseInt(result[1], 10)) : max;
    }, 0);

    newRuleSet.name = `${newRuleSet.name} ${maxNumber + 1}`;

    setEntries(push(entries, { ruleSet: newRuleSet, open: true }));
  }

  function replaceRuleSet(index: number, ruleSet: StoredRuleSet) {
    const newEntries = replaceAt(entries, index, { ...entries[index], ruleSet });
    setEntries(newEntries);
    onChange(filterAvailableRuleSets(newEntries)); // filter editing
  }

  function updateRules(rules: StoredRule[], ruleSetIndex: number) {
    if (rules.length === 0) {
      // A canceled first rule, or a saved set's last rule (not offered on the page)
      removeRuleSet(ruleSetIndex);
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

// Stored rule sets are matched by ID. Unsaved ones are not in storage; each
// keeps its place after the stored rule set before it.
function mergeEntries(
  stored: StoredRuleSets,
  entries: RuleSetEntry[]
): RuleSetEntry[] {
  const storedIds = new Set(stored.map((ruleSet) => ruleSet.id));
  const previous = new Map(entries.map((entry) => [entry.ruleSet.id, entry]));
  const pending: { entry: RuleSetEntry; after: string | null }[] = [];
  let after: string | null = null;
  entries.forEach((entry) => {
    if (storedIds.has(entry.ruleSet.id)) {
      after = entry.ruleSet.id;
    } else if (isUnsaved(entry)) {
      pending.push({ entry, after });
    }
  });
  const followers = (id: string | null) =>
    pending.filter((p) => p.after === id).map((p) => p.entry);

  // Open the only rule set when the list is first filled
  const openNew = entries.length === 0 && stored.length === 1;

  const merged = stored.flatMap((original) => {
    const ruleSet = cloneDeep(original);
    const entry = previous.get(original.id);
    // Keep the rules being added to this rule set
    entry?.ruleSet.rules.forEach((rule, ruleIndex) => {
      if (rule.id === RULE_ID_EDITING) {
        ruleSet.rules.splice(ruleIndex, 0, rule);
      }
    });
    return [
      { ruleSet, open: entry?.open ?? openNew },
      ...followers(original.id),
    ];
  });
  return [...followers(null), ...merged];
}
