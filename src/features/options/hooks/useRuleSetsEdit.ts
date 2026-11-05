import { useRef, useState } from "react";
import omit from "lodash-es/omit";
import { Rule } from "@/modules/core/rules";
import {
  RULE_ID_UNSAVED,
  StoredRuleSet,
  StoredRuleSets,
} from "@/modules/rules/stored";
import { newRuleSetName, newRuleTemplate } from "@/modules/rules/template";

export type RuleSetsChange = (stored: StoredRuleSets) => StoredRuleSets;

// Called with the stored rule sets in the same step that shows them
export type RuleSetsSaved = (saved: StoredRuleSets) => void;

// Resolves to the stored rule sets, or to false when the save was rejected
export type SaveRuleSets = (
  change: RuleSetsChange,
  onSaved?: RuleSetsSaved
) => Promise<StoredRuleSets | false>;

export type RuleEntry = {
  // Stays the same from when the rule is added until it is removed
  key: string;
  rule: Rule;
  // Undefined until the rule is saved
  id?: number;
};

export type RuleSetEntry = {
  id: string;
  name: string;
  rules: RuleEntry[];
  // Whether its accordion starts open when it is first rendered
  open: boolean;
};

type NewRule = { key: string; ruleSetId: string };
type NewRuleSet = { id: string; name: string };

// Shows the stored rule sets with what this page has not saved yet on top
export function useRuleSetsEdit(stored: StoredRuleSets, save: SaveRuleSets) {
  // Rule sets added on this page whose first rule is not saved yet
  const [newRuleSets, setNewRuleSets] = useState<NewRuleSet[]>([]);
  const [newRules, setNewRules] = useState<NewRule[]>([]);
  // A new name is shown while it is saved, and the stored one again if the save is rejected
  const [savingNames, setSavingNames] = useState<Record<string, string>>({});
  // Rules added on this page keep their key once saved, so their editors stay
  const savedKeys = useRef(new Map<number, string>());

  const storedIds = new Set(stored.map((ruleSet) => ruleSet.id));
  const newEntries = (ruleSetId: string): RuleEntry[] =>
    newRules
      .filter((newRule) => newRule.ruleSetId === ruleSetId)
      .map(({ key }) => ({ key, rule: newRuleTemplate }));

  const shown: Omit<RuleSetEntry, "open">[] = [
    ...stored.map((ruleSet) => ({
      id: ruleSet.id,
      name: savingNames[ruleSet.id] ?? ruleSet.name,
      rules: [
        ...ruleSet.rules.map((rule) => ({
          key: savedKeys.current.get(rule.id) ?? `rule-${rule.id}`,
          rule,
          id: rule.id,
        })),
        ...newEntries(ruleSet.id),
      ],
    })),
    ...newRuleSets
      .filter((ruleSet) => !storedIds.has(ruleSet.id))
      .map(({ id, name }) => ({ id, name, rules: newEntries(id) })),
  ];
  const isNewHere = (id: string) =>
    newRuleSets.some((ruleSet) => ruleSet.id === id);
  // Read only when an accordion is first rendered
  const entries: RuleSetEntry[] = shown.map((entry) => ({
    ...entry,
    open: shown.length === 1 || isNewHere(entry.id),
  }));

  function dropNewRule(key: string) {
    setNewRules((current) => current.filter((newRule) => newRule.key !== key));
  }

  function dropNewRuleSet(id: string) {
    setNewRuleSets((current) => current.filter((ruleSet) => ruleSet.id !== id));
    setNewRules((current) =>
      current.filter((newRule) => newRule.ruleSetId !== id)
    );
  }

  function addRuleSet() {
    const pattern = new RegExp(`^${newRuleSetName} (\\d+)`);
    const maxNumber = entries.reduce((max, { name }) => {
      const result = pattern.exec(name);
      return result ? Math.max(max, parseInt(result[1], 10)) : max;
    }, 0);
    const id = crypto.randomUUID();
    const name = `${newRuleSetName} ${maxNumber + 1}`;
    setNewRuleSets((current) => [...current, { id, name }]);
    setNewRules((current) => [
      ...current,
      { key: crypto.randomUUID(), ruleSetId: id },
    ]);
  }

  function addRule(ruleSetId: string) {
    setNewRules((current) => [
      ...current,
      { key: crypto.randomUUID(), ruleSetId },
    ]);
  }

  async function saveNewRule(ruleSetId: string, key: string, rule: Rule) {
    const newRule = { ...rule, id: RULE_ID_UNSAVED };
    const { name } = entries.find((entry) => entry.id === ruleSetId)!;
    // A rule set that is new, or was removed meanwhile, is stored with this rule
    const saved = await save(
      (current) =>
        current.some((ruleSet) => ruleSet.id === ruleSetId)
          ? current.map((ruleSet) =>
              ruleSet.id === ruleSetId
                ? { ...ruleSet, rules: [...ruleSet.rules, newRule] }
                : ruleSet
            )
          : [...current, { id: ruleSetId, name, rules: [newRule] }],
      // In the same render as the saved rule, so its editor keeps the key
      (saved) => {
        // The service keeps the order, so the rule added is the last one
        const { rules } = saved.find((ruleSet) => ruleSet.id === ruleSetId)!;
        savedKeys.current.set(rules[rules.length - 1].id, key);
        dropNewRule(key);
        setNewRuleSets((current) => current.filter(({ id }) => id !== ruleSetId));
      }
    );
    return saved !== false;
  }

  function updateRule(ruleSetId: string, ruleId: number, rule: Rule) {
    return saveRules(ruleSetId, (rules) =>
      rules.map((stored) =>
        stored.id === ruleId ? { ...rule, id: ruleId } : stored
      )
    );
  }

  async function removeRule(ruleSetId: string, ruleId: number) {
    const saved = await saveRules(ruleSetId, (rules) =>
      rules.filter((stored) => stored.id !== ruleId)
    );
    if (saved) savedKeys.current.delete(ruleId);
    return saved;
  }

  async function saveRules(
    ruleSetId: string,
    change: (rules: StoredRuleSet["rules"]) => StoredRuleSet["rules"]
  ) {
    const saved = await save((current) =>
      current
        .map((ruleSet) =>
          ruleSet.id === ruleSetId
            ? { ...ruleSet, rules: change(ruleSet.rules) }
            : ruleSet
        )
        // The rule set goes with its last rule
        .filter((ruleSet) => ruleSet.id !== ruleSetId || ruleSet.rules.length > 0)
    );
    return saved !== false;
  }

  function cancelNewRule(ruleSetId: string, key: string) {
    if (storedIds.has(ruleSetId)) {
      dropNewRule(key);
    } else {
      // A canceled first rule takes its new rule set with it
      dropNewRuleSet(ruleSetId);
    }
  }

  async function removeRuleSet(id: string) {
    if (!storedIds.has(id)) {
      dropNewRuleSet(id);
      return;
    }
    const { rules } = stored.find((ruleSet) => ruleSet.id === id)!;
    const saved = await save((current) =>
      current.filter((ruleSet) => ruleSet.id !== id)
    );
    if (saved === false) return;
    dropNewRuleSet(id);
    rules.forEach((rule) => savedKeys.current.delete(rule.id));
  }

  async function renameRuleSet(id: string, name: string) {
    if (!storedIds.has(id)) {
      setNewRuleSets((current) =>
        current.map((ruleSet) => (ruleSet.id === id ? { id, name } : ruleSet))
      );
      return;
    }
    setSavingNames((current) => ({ ...current, [id]: name }));
    await save((current) =>
      current.map((ruleSet) => (ruleSet.id === id ? { ...ruleSet, name } : ruleSet))
    );
    // A later rename that is still saving keeps its name shown
    setSavingNames((current) =>
      current[id] === name ? omit(current, id) : current
    );
  }

  return {
    entries,
    addRuleSet,
    addRule,
    saveNewRule,
    updateRule,
    removeRule,
    cancelNewRule,
    removeRuleSet,
    renameRuleSet,
  };
}
