import { useRef, useState } from "react";
import { beforeAll, describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import {
  RuleSetsChange,
  SaveRuleSets,
} from "@/features/options/hooks/useRuleSetsEdit";
import { RuleActionType } from "@/modules/core/rules";
import { MAX_RULES } from "@/modules/rules/limits";
import { RULE_ID_UNSAVED, StoredRuleSets } from "@/modules/rules/stored";
import { renderWithChakra } from "@/test/utils/render";
import { RuleSetsEdit } from "./RuleSetsEdit";

// Stores rule sets as the service does, giving new rules IDs
function useStoredRuleSets(initial: StoredRuleSets) {
  const [ruleSets, setRuleSets] = useState(initial);
  const latest = useRef(initial);
  const nextId = useRef(100);
  const store = (stored: StoredRuleSets) => {
    latest.current = stored;
    setRuleSets(stored);
  };
  const save = async (change: RuleSetsChange) => {
    store(
      change(latest.current).map((ruleSet) => ({
        ...ruleSet,
        rules: ruleSet.rules.map((rule) =>
          rule.id === RULE_ID_UNSAVED ? { ...rule, id: nextId.current++ } : rule
        ),
      }))
    );
    return latest.current;
  };
  return { ruleSets, store, save };
}

function StatefulRuleSetsEdit({
  initialRuleSets,
  titleFontAdjuster = 0,
  onChangeCapture,
  testId,
}: {
  initialRuleSets: StoredRuleSets;
  titleFontAdjuster?: number;
  onChangeCapture?: (ruleSets: StoredRuleSets) => void;
  testId?: string;
}) {
  const { ruleSets, save } = useStoredRuleSets(initialRuleSets);
  return (
    <div data-testid={testId}>
      <RuleSetsEdit
        ruleSets={ruleSets}
        titleFontAdjuster={titleFontAdjuster}
        save={async (change) => {
          const saved = await save(change);
          onChangeCapture?.(saved);
          return saved;
        }}
      />
    </div>
  );
}

const noSave: SaveRuleSets = async () => false;

// Test data: two rule sets
const twoRuleSets: StoredRuleSets = [
  {
    id: "rs-1",
    name: "Block Ads",
    rules: [
      {
        id: 1,
        action: { type: RuleActionType.BLOCK },
        condition: { requestDomains: ["ads.example.com"] },
      },
    ],
  },
  {
    id: "rs-2",
    name: "Allow Trusted",
    rules: [
      {
        id: 2,
        action: { type: RuleActionType.ALLOW },
        condition: { initiatorDomains: ["trusted.com"] },
      },
    ],
  },
];

// Test data: single rule set
const singleRuleSet: StoredRuleSets = [
  {
    id: "rs-3",
    name: "My Rules",
    rules: [
      {
        id: 1,
        action: { type: RuleActionType.BLOCK },
        condition: { requestDomains: ["example.com"] },
      },
    ],
  },
];

// Test data: empty rule sets
const emptyRuleSets: StoredRuleSets = [];

describe("RuleSetsEdit component", () => {
  beforeAll(async () => {
    await page.viewport(800, 900);
  });

  describe("Initial display", () => {
    test("displays multiple rule sets as accordion", async () => {
      await renderWithChakra(
        <div data-testid="container">
          <RuleSetsEdit
            ruleSets={twoRuleSets}
            titleFontAdjuster={0}
            save={noSave}
          />
        </div>
      );

      // "Rule Sets:" heading is displayed
      await expect.element(page.getByText("Rule Sets:")).toBeInTheDocument();

      // Each rule set title is displayed
      await expect.element(page.getByText("Block Ads")).toBeInTheDocument();
      await expect.element(page.getByText("Allow Trusted")).toBeInTheDocument();

      // "Add a Rule Set" button is displayed
      await expect
        .element(page.getByRole("button", { name: /add a rule set/i }))
        .toBeInTheDocument();

      // VRT screenshot
      await userEvent.unhover(page.getByRole("document"));
      await expect(page.getByTestId("container")).toMatchScreenshot(
        "RuleSetsEdit-two-rulesets"
      );
    });

    test("displays empty message when no rule sets", async () => {
      await renderWithChakra(
        <div data-testid="container">
          <RuleSetsEdit
            ruleSets={emptyRuleSets}
            titleFontAdjuster={0}
            save={noSave}
          />
        </div>
      );

      // Empty message is displayed
      await expect
        .element(page.getByText(/There are no rule sets available/i))
        .toBeInTheDocument();

      // "Add a Rule Set" button is displayed
      await expect
        .element(page.getByRole("button", { name: /add a rule set/i }))
        .toBeInTheDocument();

      // VRT screenshot
      await userEvent.unhover(page.getByRole("document"));
      await expect(page.getByTestId("container")).toMatchScreenshot(
        "RuleSetsEdit-empty"
      );
    });

    test("displays single rule set", async () => {
      await renderWithChakra(
        <div data-testid="container">
          <RuleSetsEdit
            ruleSets={singleRuleSet}
            titleFontAdjuster={0}
            save={noSave}
          />
        </div>
      );

      // Rule set title is displayed
      await expect.element(page.getByText("My Rules")).toBeInTheDocument();

      // "Add a Rule Set" button is displayed
      await expect
        .element(page.getByRole("button", { name: /add a rule set/i }))
        .toBeInTheDocument();

      // VRT screenshot
      await userEvent.unhover(page.getByRole("document"));
      await expect(page.getByTestId("container")).toMatchScreenshot(
        "RuleSetsEdit-single-ruleset"
      );
    });
  });

  describe("Adding rule set", () => {
    test("adds new rule set with edit form when clicking Add button", async () => {
      await page.viewport(800, 1250);

      await renderWithChakra(
        <StatefulRuleSetsEdit
          initialRuleSets={singleRuleSet}
          testId="container"
        />
      );

      // Click "Add a Rule Set" button
      await page.getByRole("button", { name: /add a rule set/i }).click();

      // New rule set is added with default name
      await expect.element(page.getByText("My Rule Set 1")).toBeInTheDocument();

      // New rule inside the rule set is in edit mode
      await expect.element(page.getByText("Editing")).toBeInTheDocument();

      // VRT screenshot: shows the edit form for new rule set
      await userEvent.unhover(page.getByRole("document"));
      await expect(page.getByTestId("container")).toMatchScreenshot(
        "RuleSetsEdit-add-ruleset-editing"
      );
    });

    test("assigns sequential numbers when adding multiple rule sets", async () => {
      // Test data with existing "My Rule Set 1"
      const ruleSetWithName1: StoredRuleSets = [
        {
          id: "rs-4",
          name: "My Rule Set 1",
          rules: [
            {
              id: 1,
              action: { type: RuleActionType.BLOCK },
              condition: { requestDomains: ["test.com"] },
            },
          ],
        },
      ];

      await renderWithChakra(
        <StatefulRuleSetsEdit
          initialRuleSets={ruleSetWithName1}
          testId="container"
        />
      );

      // Existing rule set is displayed
      await expect.element(page.getByText("My Rule Set 1")).toBeInTheDocument();

      // Add new rule set
      await page.getByRole("button", { name: /add a rule set/i }).click();

      // New rule set is added with sequential number (2 since 1 exists)
      await expect.element(page.getByText("My Rule Set 2")).toBeInTheDocument();
    });
  });

  describe("Rule sets saved while adding one", () => {
    const importedRuleSet = {
      id: "rs-imported",
      name: "Imported",
      rules: [
        {
          id: 3,
          action: { type: RuleActionType.BLOCK },
          condition: { requestDomains: ["imported.example.com"] },
        },
      ],
    };

    // Saves rule sets from outside, as an import or another window does
    function WithExternalSave() {
      const { ruleSets, store, save } = useStoredRuleSets(singleRuleSet);
      return (
        <>
          <button onClick={() => store([...ruleSets, importedRuleSet])}>
            external save
          </button>
          <RuleSetsEdit
            ruleSets={ruleSets}
            titleFontAdjuster={0}
            save={save}
          />
        </>
      );
    }

    test("keeps the new rule set and the imported one apart, and cancels only the new one", async () => {
      await renderWithChakra(<WithExternalSave />);

      await page.getByRole("button", { name: /add a rule set/i }).click();
      await expect.element(page.getByText("My Rule Set 1")).toBeInTheDocument();

      await page.getByRole("button", { name: "external save" }).click();

      await expect.element(page.getByText("Imported")).toBeInTheDocument();
      await expect.element(page.getByText("My Rule Set 1")).toBeInTheDocument();

      await page.getByRole("button", { name: "Cancel" }).click();

      await expect
        .element(page.getByText("My Rule Set 1"))
        .not.toBeInTheDocument();
      await expect.element(page.getByText("Imported")).toBeInTheDocument();
      await expect.element(page.getByText("My Rules")).toBeInTheDocument();
    });
  });

  describe("Rule set renamed elsewhere", () => {
    function WithExternalRename() {
      const { ruleSets, store, save } = useStoredRuleSets(singleRuleSet);
      return (
        <>
          <button onClick={() => store([{ ...ruleSets[0], name: "Renamed" }])}>
            external rename
          </button>
          <RuleSetsEdit
            ruleSets={ruleSets}
            titleFontAdjuster={0}
            save={save}
          />
        </>
      );
    }

    test("shows the new name", async () => {
      await renderWithChakra(<WithExternalRename />);
      await expect.element(page.getByText("My Rules")).toBeInTheDocument();

      await page.getByRole("button", { name: "external rename" }).click();

      await expect.element(page.getByText("Renamed")).toBeInTheDocument();
      await expect.element(page.getByText("My Rules")).not.toBeInTheDocument();
    });
  });

  describe("Removing rule set", () => {
    test("removes rule set via menu", async () => {
      const onChangeCapture = vi.fn();
      await renderWithChakra(
        <StatefulRuleSetsEdit
          initialRuleSets={twoRuleSets}
          onChangeCapture={onChangeCapture}
        />
      );

      // Click menu button for the first rule set
      const menuButtons = page.getByRole("button", { name: "more" });
      await menuButtons.nth(0).click();

      // Click "Remove" menu item
      await page.getByRole("menuitem", { name: /remove/i }).click();

      // Confirmation dialog is displayed
      await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();

      // Click "Remove" button in dialog
      const dialogRemoveButton = page
        .getByRole("alertdialog")
        .getByRole("button", { name: /remove/i });
      await dialogRemoveButton.click();

      // The rule set is stored without the removed one
      await expect.poll(() => onChangeCapture.mock.calls.length).toBe(1);
      const lastCall =
        onChangeCapture.mock.calls[onChangeCapture.mock.calls.length - 1];
      const remainingRuleSets = lastCall?.[0] as StoredRuleSets;
      expect(remainingRuleSets).toHaveLength(1);
      expect(remainingRuleSets[0].name).toBe("Allow Trusted");
    });
  });

  describe("Editing rule set title", () => {
    test("edits title via Edit button", async () => {
      const onChangeCapture = vi.fn();
      await renderWithChakra(
        <StatefulRuleSetsEdit
          initialRuleSets={singleRuleSet}
          onChangeCapture={onChangeCapture}
        />
      );

      // Rule set title is displayed
      await expect.element(page.getByText("My Rules")).toBeInTheDocument();

      // Click Edit button next to title (first Edit button = EditableTitle's button)
      await page.getByRole("button", { name: "Edit" }).first().click();

      // Input field is displayed
      await expect.element(page.getByRole("textbox")).toBeInTheDocument();

      const titleInput = page.getByRole("textbox").first();
      await titleInput.clear();
      await titleInput.fill("Updated Title");

      // Click Apply button to confirm
      await page.getByRole("button", { name: "Apply" }).click();

      // The rule set is stored with the new title
      await expect.poll(() => onChangeCapture.mock.calls.length).toBe(1);
      const updatedRuleSets = onChangeCapture.mock.calls[0][0] as StoredRuleSets;
      expect(updatedRuleSets[0].name).toBe("Updated Title");
      await expect.element(page.getByText("Updated Title")).toBeInTheDocument();
    });
  });

  describe("Accordion operations", () => {
    test("opens and closes accordion", async () => {
      await renderWithChakra(
        <StatefulRuleSetsEdit
          initialRuleSets={twoRuleSets}
          testId="container"
        />
      );

      // Initially closed (for multiple rule sets)
      // Click first accordion to open
      await page.getByText("Block Ads").first().click();

      // Rule inside is displayed
      await expect
        .element(page.getByText("ads.example.com", { exact: true }))
        .toBeInTheDocument();

      // VRT screenshot (opened state)
      await userEvent.unhover(page.getByRole("document"));
      await expect(page.getByTestId("container")).toMatchScreenshot(
        "RuleSetsEdit-accordion-open"
      );
    });
  });

  describe("Closed rule sets", () => {
    test("renders the rules of a closed rule set only once it opens", async () => {
      await renderWithChakra(
        <StatefulRuleSetsEdit initialRuleSets={twoRuleSets} />
      );

      await expect.element(page.getByText("Block Ads")).toBeInTheDocument();
      expect(
        page.getByText("ads.example.com", { exact: true }).query()
      ).toBeNull();

      await page.getByText("Block Ads").click();

      await expect
        .element(page.getByText("ads.example.com", { exact: true }))
        .toBeInTheDocument();
    });
  });

  describe("Rule limit", () => {
    // The large rule set stays closed, so its rules are not rendered
    const ruleSetsWith = (count: number): StoredRuleSets => [
      twoRuleSets[0],
      {
        id: "rs-large",
        name: "Large",
        rules: Array.from({ length: count - 1 }, (_, i) => ({
          id: 100 + i,
          action: { type: RuleActionType.BLOCK },
          condition: { urlFilter: `/large/${i}` },
        })),
      },
    ];

    test("disables adding rules and rule sets once the limit is reached", async () => {
      await renderWithChakra(
        <StatefulRuleSetsEdit initialRuleSets={ruleSetsWith(MAX_RULES)} />
      );
      await page.getByText("Block Ads").click();

      await expect
        .element(page.getByRole("button", { name: "Add a Rule", exact: true }))
        .toBeDisabled();
      await expect
        .element(page.getByRole("button", { name: /add a rule set/i }))
        .toBeDisabled();
      await expect
        .element(page.getByText("You can define up to 500 rules.").first())
        .toBeVisible();
    });

    test("counts a rule being added towards the limit", async () => {
      await renderWithChakra(
        <StatefulRuleSetsEdit initialRuleSets={ruleSetsWith(MAX_RULES - 1)} />
      );
      await page.getByText("Block Ads").click();
      const addRuleSet = page.getByRole("button", { name: /add a rule set/i });
      await expect.element(addRuleSet).toBeEnabled();

      await page.getByRole("button", { name: "Add a Rule", exact: true }).click();

      await expect.element(addRuleSet).toBeDisabled();
    });
  });

  describe("Rule operations within rule set", () => {
    test("stores a rule added to a rule set and shows it saved", async () => {
      const onChangeCapture = vi.fn();
      await renderWithChakra(
        <StatefulRuleSetsEdit
          initialRuleSets={singleRuleSet}
          onChangeCapture={onChangeCapture}
        />
      );

      await page.getByRole("button", { name: "Add a Rule", exact: true }).click();
      await page.getByRole("textbox").first().fill("added.example.com");
      await page.getByRole("button", { name: "Save" }).click();

      await expect.poll(() => onChangeCapture.mock.calls.length).toBe(1);
      const [stored] = onChangeCapture.mock.calls[0][0] as StoredRuleSets;
      expect(stored.rules.map((rule) => rule.id)).toEqual([1, 100]);
      expect(stored.rules[1].condition.requestDomains).toEqual(["added.example.com"]);
      await expect.element(page.getByText("added.example.com")).toBeInTheDocument();
      await expect.element(page.getByText("Editing")).not.toBeInTheDocument();
    });

    test("stores an edited rule", async () => {
      const onChangeCapture = vi.fn();
      await renderWithChakra(
        <StatefulRuleSetsEdit
          initialRuleSets={singleRuleSet}
          onChangeCapture={onChangeCapture}
        />
      );

      await page.getByRole("button", { name: "Edit", exact: true }).last().click();
      const requestDomains = page.getByRole("textbox").first();
      await requestDomains.clear();
      await requestDomains.fill("edited.example.com");
      await page.getByRole("button", { name: "Save" }).click();

      await expect.poll(() => onChangeCapture.mock.calls.length).toBe(1);
      const [stored] = onChangeCapture.mock.calls[0][0] as StoredRuleSets;
      expect(stored.rules).toHaveLength(1);
      expect(stored.rules[0].id).toBe(1);
      expect(stored.rules[0].condition.requestDomains).toEqual(["edited.example.com"]);
      await expect.element(page.getByText("edited.example.com")).toBeInTheDocument();
    });

    test("stores a rule set without a removed rule", async () => {
      const onChangeCapture = vi.fn();
      await renderWithChakra(
        <StatefulRuleSetsEdit
          initialRuleSets={[
            {
              ...singleRuleSet[0],
              rules: [
                ...singleRuleSet[0].rules,
                {
                  id: 2,
                  action: { type: RuleActionType.ALLOW },
                  condition: { requestDomains: ["kept.example.com"] },
                },
              ],
            },
          ]}
          onChangeCapture={onChangeCapture}
        />
      );

      await page.getByRole("button", { name: "more" }).nth(1).click();
      await page.getByRole("menuitem", { name: /remove/i }).click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: /remove/i })
        .click();

      await expect.poll(() => onChangeCapture.mock.calls.length).toBe(1);
      const [stored] = onChangeCapture.mock.calls[0][0] as StoredRuleSets;
      expect(stored.rules.map((rule) => rule.id)).toEqual([2]);
      await expect
        .element(page.getByText("example.com", { exact: true }))
        .not.toBeInTheDocument();
    });

    test("stores a new rule set with its first rule", async () => {
      const onChangeCapture = vi.fn();
      await renderWithChakra(
        <StatefulRuleSetsEdit
          initialRuleSets={singleRuleSet}
          onChangeCapture={onChangeCapture}
        />
      );

      await page.getByRole("button", { name: /add a rule set/i }).click();
      await page.getByRole("textbox").first().fill("first.example.com");
      await page.getByRole("button", { name: "Save" }).click();

      await expect.poll(() => onChangeCapture.mock.calls.length).toBe(1);
      const stored = onChangeCapture.mock.calls[0][0] as StoredRuleSets;
      expect(stored.map(({ name }) => name)).toEqual(["My Rules", "My Rule Set 1"]);
      expect(stored[1].rules[0].condition.requestDomains).toEqual(["first.example.com"]);
      await expect.element(page.getByText("first.example.com")).toBeInTheDocument();
    });
  });
});
