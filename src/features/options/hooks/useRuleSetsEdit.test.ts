import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { Rule, RuleActionType } from "@/modules/core/rules";
import {
  RULE_ID_UNSAVED,
  StoredRule,
  StoredRuleSets,
} from "@/modules/rules/stored";
import { newRuleTemplate } from "@/modules/rules/template";
import { RuleSetsChange, useRuleSetsEdit } from "./useRuleSetsEdit";

const savedRule: StoredRule = {
  id: 1,
  action: { type: RuleActionType.BLOCK },
  condition: { requestDomains: ["example.com"] },
};

const typedRule: Rule = {
  action: { type: RuleActionType.ALLOW },
  condition: { requestDomains: ["typed.com"] },
};

const sampleRuleSets: StoredRuleSets = [
  { id: "rs-1", name: "Block Ads", rules: [savedRule] },
  { id: "rs-2", name: "Allow Trusted", rules: [{ ...savedRule, id: 2 }] },
];

// Saves like the service does: new rules get IDs, and the page gets the stored rule sets back
function setup(initial: StoredRuleSets) {
  let stored = initial;
  let nextId = 100;
  const save = vi.fn(async (change: RuleSetsChange): Promise<StoredRuleSets | false> => {
    stored = change(stored).map((ruleSet) => ({
      ...ruleSet,
      rules: ruleSet.rules.map((rule) =>
        rule.id === RULE_ID_UNSAVED ? { ...rule, id: nextId++ } : rule
      ),
    }));
    hook.rerender({ ruleSets: stored });
    return stored;
  });
  // Rejects the next save, leaving the stored rule sets as they are
  const rejectNext = () => save.mockImplementationOnce(async () => false);
  const hook = renderHook(
    ({ ruleSets }) => useRuleSetsEdit(ruleSets, save),
    { initialProps: { ruleSets: stored } }
  );
  return {
    result: hook.result,
    save,
    rejectNext,
    // Rule sets stored by something other than this page, such as an import
    storeElsewhere: (ruleSets: StoredRuleSets) => {
      stored = ruleSets;
      hook.rerender({ ruleSets });
    },
    stored: () => stored,
  };
}

const names = (entries: { name: string }[]) => entries.map(({ name }) => name);

describe("useRuleSetsEdit", () => {
  describe("entries", () => {
    test("shows the stored rule sets, each rule keyed by its ID", () => {
      const { result } = setup(sampleRuleSets);

      expect(result.current.entries).toStrictEqual([
        {
          id: "rs-1",
          name: "Block Ads",
          rules: [{ key: "rule-1", rule: savedRule, id: 1 }],
          open: false,
        },
        {
          id: "rs-2",
          name: "Allow Trusted",
          rules: [{ key: "rule-2", rule: { ...savedRule, id: 2 }, id: 2 }],
          open: false,
        },
      ]);
    });

    test("is empty when nothing is stored", () => {
      const { result } = setup([]);
      expect(result.current.entries).toStrictEqual([]);
    });

    test("opens a rule set when it is the only one", () => {
      const { result } = setup([sampleRuleSets[0]]);
      expect(result.current.entries.map(({ open }) => open)).toEqual([true]);
    });
  });

  describe("addRuleSet", () => {
    test("adds an open rule set with a new rule at the end, without saving", () => {
      const { result, save } = setup(sampleRuleSets);

      act(() => result.current.addRuleSet());

      const added = result.current.entries[2];
      expect(added.name).toBe("My Rule Set 1");
      expect(added.open).toBe(true);
      expect(added.rules).toStrictEqual([
        { key: expect.any(String), rule: newRuleTemplate },
      ]);
      expect(save).not.toHaveBeenCalled();
    });

    test("numbers each after the highest number in use", () => {
      const { result } = setup([
        { id: "rs-3", name: "My Rule Set 3", rules: [savedRule] },
      ]);

      act(() => result.current.addRuleSet());
      act(() => result.current.addRuleSet());

      expect(names(result.current.entries)).toEqual([
        "My Rule Set 3",
        "My Rule Set 4",
        "My Rule Set 5",
      ]);
    });

    test("gives each new rule set its own ID", () => {
      const { result } = setup([]);

      act(() => result.current.addRuleSet());
      act(() => result.current.addRuleSet());

      const [first, second] = result.current.entries;
      expect(first.id).not.toBe(second.id);
    });

    test("keeps a new rule set after rule sets stored elsewhere meanwhile", () => {
      const { result, storeElsewhere } = setup(sampleRuleSets);

      act(() => result.current.addRuleSet());
      act(() =>
        storeElsewhere([
          ...sampleRuleSets,
          { id: "rs-imported", name: "Imported", rules: [savedRule] },
        ])
      );

      expect(names(result.current.entries)).toEqual([
        "Block Ads",
        "Allow Trusted",
        "Imported",
        "My Rule Set 1",
      ]);
    });
  });

  describe("addRule", () => {
    test("adds a new rule at the end of the rule set, without saving", () => {
      const { result, save } = setup(sampleRuleSets);

      act(() => result.current.addRule("rs-1"));

      expect(result.current.entries[0].rules).toStrictEqual([
        { key: "rule-1", rule: savedRule, id: 1 },
        { key: expect.any(String), rule: newRuleTemplate },
      ]);
      expect(result.current.entries[1].rules).toHaveLength(1);
      expect(save).not.toHaveBeenCalled();
    });

    test("drops a new rule whose rule set was removed elsewhere", () => {
      const { result, storeElsewhere } = setup(sampleRuleSets);

      act(() => result.current.addRule("rs-1"));
      act(() => storeElsewhere([sampleRuleSets[1]]));

      expect(result.current.entries).toHaveLength(1);
      expect(result.current.entries[0].rules).toHaveLength(1);
    });
  });

  describe("saveNewRule", () => {
    test("adds the rule to its stored rule set and keeps its key once saved", async () => {
      const { result, stored } = setup(sampleRuleSets);
      act(() => result.current.addRule("rs-1"));
      const { key } = result.current.entries[0].rules[1];

      let saved: boolean | undefined;
      await act(async () => {
        saved = await result.current.saveNewRule("rs-1", key, typedRule);
      });

      expect(saved).toBe(true);
      expect(stored()[0].rules).toStrictEqual([savedRule, { ...typedRule, id: 100 }]);
      expect(result.current.entries[0].rules).toStrictEqual([
        { key: "rule-1", rule: savedRule, id: 1 },
        { key, rule: { ...typedRule, id: 100 }, id: 100 },
      ]);
    });

    test("stores a new rule set with its first rule", async () => {
      const { result, stored } = setup(sampleRuleSets);
      act(() => result.current.addRuleSet());
      act(() => {
        void result.current.renameRuleSet(result.current.entries[2].id, "Renamed");
      });
      const { id, rules } = result.current.entries[2];

      await act(async () => {
        await result.current.saveNewRule(id, rules[0].key, typedRule);
      });

      expect(stored()[2]).toStrictEqual({
        id,
        name: "Renamed",
        rules: [{ ...typedRule, id: 100 }],
      });
      expect(result.current.entries).toHaveLength(3);
      expect(result.current.entries[2].rules).toStrictEqual([
        { key: rules[0].key, rule: { ...typedRule, id: 100 }, id: 100 },
      ]);
    });

    test("keeps the new rule when the save is rejected", async () => {
      const { result, rejectNext } = setup(sampleRuleSets);
      act(() => result.current.addRuleSet());
      const { id, rules } = result.current.entries[2];

      rejectNext();
      let saved: boolean | undefined;
      await act(async () => {
        saved = await result.current.saveNewRule(id, rules[0].key, typedRule);
      });

      expect(saved).toBe(false);
      expect(result.current.entries[2]).toStrictEqual({
        id,
        name: "My Rule Set 1",
        rules,
        open: true,
      });
    });
  });

  describe("updateRule", () => {
    test("replaces the stored rule, keeping its ID", async () => {
      const { result, stored } = setup(sampleRuleSets);

      let saved: boolean | undefined;
      await act(async () => {
        saved = await result.current.updateRule("rs-2", 2, typedRule);
      });

      expect(saved).toBe(true);
      expect(stored()).toStrictEqual([
        sampleRuleSets[0],
        { ...sampleRuleSets[1], rules: [{ ...typedRule, id: 2 }] },
      ]);
    });

    test("leaves the other rules of the rule set as they are", async () => {
      const others = { ...savedRule, id: 3 };
      const { result, stored } = setup([
        { id: "rs-1", name: "Two", rules: [savedRule, others] },
      ]);

      await act(async () => {
        await result.current.updateRule("rs-1", 1, typedRule);
      });

      expect(stored()[0].rules).toStrictEqual([{ ...typedRule, id: 1 }, others]);
    });

    test("leaves a rule set without rules elsewhere as it is", async () => {
      const empty = { id: "rs-0", name: "Empty", rules: [] };
      const { result, stored } = setup([empty, ...sampleRuleSets]);

      await act(async () => {
        await result.current.updateRule("rs-2", 2, typedRule);
      });

      expect(stored()[0]).toStrictEqual(empty);
    });

    test("resolves to false when the save is rejected", async () => {
      const { result, rejectNext, stored } = setup(sampleRuleSets);

      rejectNext();
      let saved: boolean | undefined;
      await act(async () => {
        saved = await result.current.updateRule("rs-2", 2, typedRule);
      });

      expect(saved).toBe(false);
      expect(stored()).toBe(sampleRuleSets);
    });
  });

  describe("removeRule", () => {
    test("removes the stored rule", async () => {
      const twoRules: StoredRuleSets = [
        { id: "rs-1", name: "Two", rules: [savedRule, { ...savedRule, id: 2 }] },
      ];
      const { result, stored } = setup(twoRules);

      await act(async () => {
        await result.current.removeRule("rs-1", 1);
      });

      expect(stored()).toStrictEqual([
        { id: "rs-1", name: "Two", rules: [{ ...savedRule, id: 2 }] },
      ]);
    });

    test("removes the rule set with its last rule", async () => {
      const { result, stored } = setup(sampleRuleSets);

      await act(async () => {
        await result.current.removeRule("rs-1", 1);
      });

      expect(stored()).toStrictEqual([sampleRuleSets[1]]);
    });
    test("keeps the rule when the save is rejected", async () => {
      const { result, rejectNext, stored } = setup(sampleRuleSets);

      rejectNext();
      let saved: boolean | undefined;
      await act(async () => {
        saved = await result.current.removeRule("rs-1", 1);
      });

      expect(saved).toBe(false);
      expect(stored()).toBe(sampleRuleSets);
    });

    test("forgets the key of a rule added on this page", async () => {
      const { result, stored, storeElsewhere } = setup(sampleRuleSets);
      act(() => result.current.addRule("rs-1"));
      const { key } = result.current.entries[0].rules[1];
      await act(async () => {
        await result.current.saveNewRule("rs-1", key, typedRule);
      });
      const before = stored();

      await act(async () => {
        await result.current.removeRule("rs-1", 100);
      });
      act(() => storeElsewhere(before));

      expect(result.current.entries[0].rules[1].key).toBe("rule-100");
    });
  });

  describe("cancelNewRule", () => {
    test("drops a new rule from a stored rule set, without saving", () => {
      const { result, save } = setup(sampleRuleSets);
      act(() => result.current.addRule("rs-1"));

      act(() =>
        result.current.cancelNewRule("rs-1", result.current.entries[0].rules[1].key)
      );

      expect(result.current.entries[0].rules).toHaveLength(1);
      expect(save).not.toHaveBeenCalled();
    });

    test("drops a new rule set with its first rule", () => {
      const { result, save } = setup(sampleRuleSets);
      act(() => result.current.addRuleSet());
      const { id, rules } = result.current.entries[2];

      act(() => result.current.cancelNewRule(id, rules[0].key));

      expect(names(result.current.entries)).toEqual(["Block Ads", "Allow Trusted"]);
      expect(save).not.toHaveBeenCalled();
    });
  });

  describe("removeRuleSet", () => {
    test("drops a new rule set, without saving", async () => {
      const { result, save } = setup(sampleRuleSets);
      act(() => result.current.addRuleSet());

      await act(async () => {
        await result.current.removeRuleSet(result.current.entries[2].id);
      });

      expect(result.current.entries).toHaveLength(2);
      expect(save).not.toHaveBeenCalled();
    });

    test("removes a stored rule set with the rules being added to it", async () => {
      const { result, stored, storeElsewhere } = setup(sampleRuleSets);
      act(() => result.current.addRule("rs-1"));

      await act(async () => {
        await result.current.removeRuleSet("rs-1");
      });
      expect(stored()).toStrictEqual([sampleRuleSets[1]]);

      // The new rule does not come back with a rule set of the same ID
      act(() => storeElsewhere(sampleRuleSets));
      expect(result.current.entries[0].rules).toHaveLength(1);
    });

    test("forgets the keys of the rules added on this page", async () => {
      const { result, stored, storeElsewhere } = setup(sampleRuleSets);
      act(() => result.current.addRule("rs-1"));
      const { key } = result.current.entries[0].rules[1];
      await act(async () => {
        await result.current.saveNewRule("rs-1", key, typedRule);
      });
      const before = stored();

      await act(async () => {
        await result.current.removeRuleSet("rs-1");
      });
      act(() => storeElsewhere(before));

      expect(result.current.entries[0].rules[1].key).toBe("rule-100");
    });

    test("keeps showing a rule set whose removal is rejected", async () => {
      const { result, rejectNext } = setup(sampleRuleSets);
      act(() => result.current.addRule("rs-1"));

      rejectNext();
      await act(async () => {
        await result.current.removeRuleSet("rs-1");
      });

      expect(names(result.current.entries)).toEqual(["Block Ads", "Allow Trusted"]);
      expect(result.current.entries[0].rules).toHaveLength(2);
    });
  });

  describe("renameRuleSet", () => {
    test("renames a new rule set, without saving", () => {
      const { result, save } = setup(sampleRuleSets);
      act(() => result.current.addRuleSet());
      act(() => result.current.addRuleSet());

      act(() => {
        void result.current.renameRuleSet(result.current.entries[2].id, "New");
      });

      expect(names(result.current.entries)).toEqual([
        "Block Ads",
        "Allow Trusted",
        "New",
        "My Rule Set 2",
      ]);
      expect(save).not.toHaveBeenCalled();
    });

    test("saves the name of a stored rule set, showing it while it is saved", async () => {
      const { result, save, stored } = setup(sampleRuleSets);
      let finish!: () => void;
      save.mockImplementationOnce(async (change) => {
        await new Promise<void>((resolve) => (finish = resolve));
        return change(sampleRuleSets);
      });

      let renamed!: Promise<void>;
      act(() => {
        renamed = result.current.renameRuleSet("rs-2", "Renamed");
      });
      expect(names(result.current.entries)).toEqual(["Block Ads", "Renamed"]);

      await act(async () => {
        finish();
        await renamed;
      });
      // Shown from the stored rule sets again, which this mock left as they were
      expect(names(result.current.entries)).toEqual(["Block Ads", "Allow Trusted"]);
      expect(stored()).toBe(sampleRuleSets);
    });

    test("keeps showing a later name while it is still saving", async () => {
      const { result, save } = setup(sampleRuleSets);
      const finishes: (() => void)[] = [];
      save.mockImplementation(async (change) => {
        await new Promise<void>((resolve) => finishes.push(resolve));
        return change(sampleRuleSets);
      });

      let first!: Promise<void>;
      act(() => {
        first = result.current.renameRuleSet("rs-2", "First");
      });
      act(() => {
        void result.current.renameRuleSet("rs-2", "Second");
      });
      await act(async () => {
        finishes[0]();
        await first;
      });

      expect(names(result.current.entries)).toEqual(["Block Ads", "Second"]);
    });

    test("goes back to the stored name when the save is rejected", async () => {
      const { result, rejectNext } = setup(sampleRuleSets);

      rejectNext();
      await act(async () => {
        await result.current.renameRuleSet("rs-2", "Renamed");
      });

      expect(names(result.current.entries)).toEqual(["Block Ads", "Allow Trusted"]);
    });

    test("applies the new name to the stored rule set", async () => {
      const { result, stored } = setup(sampleRuleSets);

      await act(async () => {
        await result.current.renameRuleSet("rs-2", "Renamed");
      });

      expect(stored()[1]).toStrictEqual({ ...sampleRuleSets[1], name: "Renamed" });
      expect(names(result.current.entries)).toEqual(["Block Ads", "Renamed"]);
    });
  });
});
