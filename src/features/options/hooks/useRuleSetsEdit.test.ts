import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { Rule, RuleActionType } from "@/modules/core/rules";
import { SaveConflictError } from "@/modules/rules/conflict";
import {
  RULE_ID_UNSAVED,
  StoredRule,
  StoredRuleSets,
} from "@/modules/rules/stored";
import { newRuleTemplate } from "@/modules/rules/template";
import {
  RuleSetEntry,
  RuleSetsChange,
  RuleSetsSaved,
  SaveRejection,
  SaveResult,
  useRuleSetsEdit,
} from "./useRuleSetsEdit";

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
  const save = vi.fn(
    async (change: RuleSetsChange, onSaved?: RuleSetsSaved): Promise<StoredRuleSets | SaveRejection> => {
      let changed: StoredRuleSets;
      try {
        changed = change(stored);
      } catch (error) {
        // Rejected like the options page does
        conflicts.push(error);
        return "conflict";
      }
      stored = changed.map((ruleSet) => ({
        ...ruleSet,
        rules: ruleSet.rules.map((rule) =>
          rule.id === RULE_ID_UNSAVED ? { ...rule, id: nextId++ } : rule
        ),
      }));
      // Shows the stored rule sets in the same render as onSaved's updates
      act(() => {
        onSaved?.(stored);
        hook.rerender({ ruleSets: stored });
      });
      return stored;
    }
  );
  const conflicts: unknown[] = [];
  // Rejects the next save, leaving the stored rule sets as they are
  const rejectNext = () => save.mockImplementationOnce(async () => false);
  // The entries of every render
  const renders: RuleSetEntry[][] = [];
  const hook = renderHook(
    ({ ruleSets }) => {
      const edit = useRuleSetsEdit(ruleSets, save);
      renders.push(edit.entries);
      return edit;
    },
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
    renders,
    conflicts,
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

      let saved: SaveResult | undefined;
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

    test("never shows the saved rule beside its new entry, or under another key", async () => {
      const { result, renders } = setup(sampleRuleSets);
      act(() => result.current.addRule("rs-1"));
      const { key } = result.current.entries[0].rules[1];
      const start = renders.length;

      // Not in act, so the stored rule sets render as soon as the save answers
      await result.current.saveNewRule("rs-1", key, typedRule);

      for (const entries of renders.slice(start)) {
        expect(entries[0].rules.map((rule) => rule.key)).toEqual(["rule-1", key]);
      }
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
      let saved: SaveResult | undefined;
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

  describe("saving over changes made on another page", () => {
    const changedRule: StoredRule = { ...savedRule, condition: { urlFilter: "/changed" } };

    function expectConflict(
      { conflicts, stored }: ReturnType<typeof setup>,
      expected: StoredRuleSets
    ) {
      expect(conflicts).toEqual([expect.any(SaveConflictError)]);
      expect(stored()).toBe(expected);
    }

    test("adds a rule to a stored rule set only while it is stored", async () => {
      const page = setup(sampleRuleSets);
      act(() => page.result.current.addRule("rs-1"));
      const { key } = page.result.current.entries[0].rules[1];
      // Saved from the page as it was before the removal arrived
      const saveNewRule = page.result.current.saveNewRule;
      const elsewhere = [sampleRuleSets[1]];
      act(() => page.storeElsewhere(elsewhere));

      let saved: SaveResult | undefined;
      await act(async () => {
        saved = await saveNewRule("rs-1", key, typedRule);
      });

      expect(saved).toBe("conflict");
      expectConflict(page, elsewhere);
    });

    test("updates a rule only while it is as it was when editing started", async () => {
      const page = setup(sampleRuleSets);
      const elsewhere = [
        sampleRuleSets[0],
        { ...sampleRuleSets[1], rules: [{ ...changedRule, id: 2 }] },
      ];
      page.storeElsewhere(elsewhere);

      let saved: SaveResult | undefined;
      await act(async () => {
        saved = await page.result.current.updateRule(
          "rs-2",
          2,
          typedRule,
          sampleRuleSets[1].rules[0]
        );
      });

      expect(saved).toBe("conflict");
      expectConflict(page, elsewhere);
    });

    test("does not update a rule removed on another page", async () => {
      const page = setup(sampleRuleSets);
      const elsewhere = [sampleRuleSets[0], { ...sampleRuleSets[1], rules: [changedRule] }];
      page.storeElsewhere(elsewhere);

      await act(async () => {
        await page.result.current.updateRule("rs-2", 2, typedRule, savedRule);
      });

      expectConflict(page, elsewhere);
    });

    test("does not save rules of a rule set removed on another page", async () => {
      const page = setup(sampleRuleSets);
      const elsewhere = [sampleRuleSets[0]];
      page.storeElsewhere(elsewhere);

      await act(async () => {
        await page.result.current.updateRule("rs-2", 2, typedRule, savedRule);
      });

      expectConflict(page, elsewhere);
    });

    test("removes a rule only while it is as shown", async () => {
      const page = setup([{ id: "rs-1", name: "Two", rules: [savedRule, { ...savedRule, id: 2 }] }]);
      const elsewhere = [{ id: "rs-1", name: "Two", rules: [{ ...changedRule, id: 1 }, { ...savedRule, id: 2 }] }];
      page.storeElsewhere(elsewhere);

      await act(async () => {
        await page.result.current.removeRule("rs-1", 1, savedRule);
      });

      expectConflict(page, elsewhere);
    });

    test("leaves a rule removed on another page as it is", async () => {
      const page = setup([{ id: "rs-1", name: "Two", rules: [savedRule, { ...savedRule, id: 2 }] }]);
      const elsewhere = [{ id: "rs-1", name: "Two", rules: [{ ...savedRule, id: 2 }] }];
      page.storeElsewhere(elsewhere);

      let saved: SaveResult | undefined;
      await act(async () => {
        saved = await page.result.current.removeRule("rs-1", 1, savedRule);
      });

      expect(saved).toBe(true);
      expect(page.conflicts).toEqual([]);
      expect(page.stored()).toStrictEqual(elsewhere);
    });

    test("leaves a rule removed on another page with its rule set as it is", async () => {
      const page = setup(sampleRuleSets);
      const elsewhere = [sampleRuleSets[1]];
      page.storeElsewhere(elsewhere);

      let saved: SaveResult | undefined;
      await act(async () => {
        saved = await page.result.current.removeRule("rs-1", 1, savedRule);
      });

      expect(saved).toBe(true);
      expect(page.conflicts).toEqual([]);
      expect(page.stored()).toStrictEqual(elsewhere);
    });

    test("compares rules without their IDs, as a new rule has none until saved", async () => {
      const page = setup(sampleRuleSets);
      const { id: _id, ...base } = sampleRuleSets[1].rules[0];

      await act(async () => {
        await page.result.current.updateRule("rs-2", 2, typedRule, base);
      });

      expect(page.conflicts).toEqual([]);
      expect(page.stored()[1].rules).toStrictEqual([{ ...typedRule, id: 2 }]);
    });

    test("removes a rule set while other rule sets changed on another page", async () => {
      const page = setup(sampleRuleSets);
      const remove = page.result.current.removeRuleSet;
      const elsewhere = [{ ...sampleRuleSets[0], rules: [changedRule] }, sampleRuleSets[1]];
      act(() => page.storeElsewhere(elsewhere));

      await act(async () => {
        await remove("rs-2");
      });

      expect(page.conflicts).toEqual([]);
      expect(page.stored()).toStrictEqual([elsewhere[0]]);
    });

    test("leaves a rule set removed on another page as it is", async () => {
      const page = setup(sampleRuleSets);
      const remove = page.result.current.removeRuleSet;
      const elsewhere = [sampleRuleSets[1]];
      act(() => page.storeElsewhere(elsewhere));

      await act(async () => {
        await remove("rs-1");
      });

      expect(page.conflicts).toEqual([]);
      expect(page.stored()).toStrictEqual(elsewhere);
    });

    test("removes a rule set renamed on another page", async () => {
      const page = setup(sampleRuleSets);
      const remove = page.result.current.removeRuleSet;
      act(() =>
        page.storeElsewhere([{ ...sampleRuleSets[0], name: "Renamed" }, sampleRuleSets[1]])
      );

      await act(async () => {
        await remove("rs-1");
      });

      expect(page.conflicts).toEqual([]);
      expect(page.stored()).toStrictEqual([sampleRuleSets[1]]);
    });

    test("does not remove a rule set whose rules changed on another page since it was shown", async () => {
      const page = setup(sampleRuleSets);
      const remove = page.result.current.removeRuleSet;
      const elsewhere = [{ ...sampleRuleSets[0], rules: [changedRule] }, sampleRuleSets[1]];
      act(() => page.storeElsewhere(elsewhere));

      await act(async () => {
        await remove("rs-1");
      });

      expectConflict(page, elsewhere);
    });

    test("does not rename a rule set renamed on another page since it was shown", async () => {
      const page = setup(sampleRuleSets);
      const rename = page.result.current.renameRuleSet;
      const elsewhere = [{ ...sampleRuleSets[0], name: "Elsewhere" }, sampleRuleSets[1]];
      act(() => page.storeElsewhere(elsewhere));

      await act(async () => {
        await rename("rs-1", "Here");
      });

      expectConflict(page, elsewhere);
      expect(names(page.result.current.entries)).toEqual(["Elsewhere", "Allow Trusted"]);
    });

    test("does not rename a rule set removed on another page", async () => {
      const page = setup(sampleRuleSets);
      const rename = page.result.current.renameRuleSet;
      const elsewhere = [sampleRuleSets[1]];
      act(() => page.storeElsewhere(elsewhere));

      await act(async () => {
        await rename("rs-1", "Here");
      });

      expectConflict(page, elsewhere);
    });

    test("renames again on top of a rename still saving", async () => {
      const page = setup(sampleRuleSets);
      const finishes: (() => void)[] = [];
      let saved = sampleRuleSets;
      page.save.mockImplementation(async (change) => {
        await new Promise<void>((resolve) => finishes.push(resolve));
        return (saved = change(saved));
      });

      let first!: Promise<void>;
      let second!: Promise<void>;
      act(() => {
        first = page.result.current.renameRuleSet("rs-2", "First");
      });
      act(() => {
        second = page.result.current.renameRuleSet("rs-2", "Second");
      });
      await act(async () => {
        finishes[0]();
        await first;
        finishes[1]();
        await second;
      });

      expect(saved[1].name).toBe("Second");
    });
  });

  describe("updateRule", () => {
    test("replaces the stored rule, keeping its ID", async () => {
      const { result, stored } = setup(sampleRuleSets);

      let saved: SaveResult | undefined;
      await act(async () => {
        saved = await result.current.updateRule("rs-2", 2, typedRule, sampleRuleSets[1].rules[0]);
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
        await result.current.updateRule("rs-1", 1, typedRule, savedRule);
      });

      expect(stored()[0].rules).toStrictEqual([{ ...typedRule, id: 1 }, others]);
    });

    test("leaves a rule set without rules elsewhere as it is", async () => {
      const empty = { id: "rs-0", name: "Empty", rules: [] };
      const { result, stored } = setup([empty, ...sampleRuleSets]);

      await act(async () => {
        await result.current.updateRule("rs-2", 2, typedRule, sampleRuleSets[1].rules[0]);
      });

      expect(stored()[0]).toStrictEqual(empty);
    });

    test("resolves to false when the save is rejected", async () => {
      const { result, rejectNext, stored } = setup(sampleRuleSets);

      rejectNext();
      let saved: SaveResult | undefined;
      await act(async () => {
        saved = await result.current.updateRule("rs-2", 2, typedRule, sampleRuleSets[1].rules[0]);
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
        await result.current.removeRule("rs-1", 1, savedRule);
      });

      expect(stored()).toStrictEqual([
        { id: "rs-1", name: "Two", rules: [{ ...savedRule, id: 2 }] },
      ]);
    });

    test("removes the rule set with its last rule", async () => {
      const { result, stored } = setup(sampleRuleSets);

      await act(async () => {
        await result.current.removeRule("rs-1", 1, savedRule);
      });

      expect(stored()).toStrictEqual([sampleRuleSets[1]]);
    });
    test("keeps the rule when the save is rejected", async () => {
      const { result, rejectNext, stored } = setup(sampleRuleSets);

      rejectNext();
      let saved: SaveResult | undefined;
      await act(async () => {
        saved = await result.current.removeRule("rs-1", 1, savedRule);
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
        await result.current.removeRule("rs-1", 100, { ...typedRule, id: 100 });
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
      let saved = sampleRuleSets;
      save.mockImplementation(async (change) => {
        await new Promise<void>((resolve) => finishes.push(resolve));
        return (saved = change(saved));
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
