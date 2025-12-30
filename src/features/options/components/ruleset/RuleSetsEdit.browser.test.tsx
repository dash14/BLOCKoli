import { useState } from "react";
import { beforeAll, describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { RuleActionType } from "@/modules/core/rules";
import { StoredRuleSets } from "@/modules/rules/stored";
import { renderWithChakra } from "@/test/utils/render";
import { RuleSetsEdit } from "./RuleSetsEdit";

// Wrapper component for controlled component testing
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
  const [ruleSets, setRuleSets] = useState(initialRuleSets);
  const handleChange = (newRuleSets: StoredRuleSets) => {
    setRuleSets(newRuleSets);
    onChangeCapture?.(newRuleSets);
  };
  return (
    <div data-testid={testId}>
      <RuleSetsEdit
        ruleSets={ruleSets}
        titleFontAdjuster={titleFontAdjuster}
        onChange={handleChange}
      />
    </div>
  );
}

// Test data: two rule sets
const twoRuleSets: StoredRuleSets = [
  {
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
            onChange={() => {}}
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
            onChange={() => {}}
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
            onChange={() => {}}
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

      // onChange is called with remaining rule sets
      expect(onChangeCapture).toHaveBeenCalled();
      const lastCall =
        onChangeCapture.mock.calls[onChangeCapture.mock.calls.length - 1];
      const remainingRuleSets = lastCall?.[0] as StoredRuleSets;
      expect(remainingRuleSets).toHaveLength(1);
      expect(remainingRuleSets[0].name).toBe("Allow Trusted");
    });
  });

  describe("Editing rule set title", () => {
    test("edits title via Edit button", async () => {
      const onChange = vi.fn();
      await renderWithChakra(
        <RuleSetsEdit
          ruleSets={singleRuleSet}
          titleFontAdjuster={0}
          onChange={onChange}
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

      // Click Submit button to confirm
      await page.getByRole("button", { name: "Submit" }).click();

      // onChange is called with updated title
      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      const updatedRuleSets = lastCall?.[0] as StoredRuleSets;
      expect(updatedRuleSets[0].name).toBe("Updated Title");
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

  // Note: Rule operations are covered in RulesEdit.browser.test.tsx.
  // This test file focuses on RuleSetsEdit-specific features:
  // add/remove rule sets, title editing, and accordion behavior.
});
