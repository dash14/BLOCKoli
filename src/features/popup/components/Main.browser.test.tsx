import { describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { RuleActionType, RuleSets } from "@/modules/core/rules";
import { MatchedRule } from "@/modules/rules/matched";
import { renderWithChakra } from "@/test/utils/render";
import { Main } from "./Main";

// Test data
const sampleRuleSets: RuleSets = [
  {
    name: "Block Ads",
    rules: [
      {
        action: { type: RuleActionType.BLOCK },
        condition: { requestDomains: ["ads.example.com"] },
      },
    ],
  },
];

const sampleMatchedRules: MatchedRule[] = [
  {
    ruleId: 1,
    rule: { ruleSetName: "Block Ads", number: 1, isBlocking: true },
    timeStamp: new Date("2024-01-01T12:00:00").getTime(),
  },
  {
    ruleId: 2,
    rule: { ruleSetName: "Block Ads", number: 2, isBlocking: false },
    timeStamp: new Date("2024-01-01T12:01:00").getTime(),
  },
];

describe("Main component", () => {
  describe("empty ruleSets", () => {
    test("renders NoRules component when ruleSets is empty", async () => {
      const getMatchedRule = vi.fn().mockResolvedValue([]);
      const changeServiceState = vi.fn();

      await renderWithChakra(
        <div data-testid="container" style={{ width: 400, height: 250 }}>
          <Main
            isServiceEnabled={true}
            changeServiceState={changeServiceState}
            ruleSets={[]}
            getMatchedRule={getMatchedRule}
            optionsUrl="chrome://extensions"
          />
        </div>
      );

      await expect
        .element(page.getByText(/no rules are defined/i))
        .toBeInTheDocument();
      await expect
        .element(page.getByRole("link", { name: /configure rules/i }))
        .toBeInTheDocument();

      // reset hover/focus states before screenshot
      await userEvent.unhover(page.getByRole("document"));
      await expect(page.getByTestId("container")).toMatchScreenshot(
        "Main-no-rules"
      );
    });
  });

  describe("with ruleSets", () => {
    test("renders main UI with switch, link, and table", async () => {
      const getMatchedRule = vi.fn().mockResolvedValue(sampleMatchedRules);
      const changeServiceState = vi.fn();

      await renderWithChakra(
        <div data-testid="container" style={{ width: 400, height: 250 }}>
          <Main
            isServiceEnabled={true}
            changeServiceState={changeServiceState}
            ruleSets={sampleRuleSets}
            getMatchedRule={getMatchedRule}
            optionsUrl="chrome://extensions"
          />
        </div>
      );

      // Check Enable Rules switch
      await expect.element(page.getByText(/enable rules/i)).toBeInTheDocument();
      await expect.element(page.getByRole("checkbox")).toBeInTheDocument();

      // Check Configure Rules link
      await expect
        .element(page.getByRole("link", { name: /configure rules/i }))
        .toBeInTheDocument();

      // Check Matched Rules table header
      await expect
        .element(page.getByText(/matched rules in tabs/i))
        .toBeInTheDocument();

      // Check table content
      await expect.element(page.getByRole("table")).toBeInTheDocument();
      await expect.element(page.getByText("Block Ads #1")).toBeInTheDocument();

      // reset hover/focus states before screenshot
      await userEvent.unhover(page.getByRole("document"));
      await expect(page.getByTestId("container")).toMatchScreenshot(
        "Main-with-rules"
      );
    });

    test("switch is checked when service is enabled", async () => {
      const getMatchedRule = vi.fn().mockResolvedValue([]);
      const changeServiceState = vi.fn();

      await renderWithChakra(
        <Main
          isServiceEnabled={true}
          changeServiceState={changeServiceState}
          ruleSets={sampleRuleSets}
          getMatchedRule={getMatchedRule}
          optionsUrl="chrome://extensions"
        />
      );

      await expect.element(page.getByRole("checkbox")).toBeChecked();
    });

    test("switch is unchecked when service is disabled", async () => {
      const getMatchedRule = vi.fn().mockResolvedValue([]);
      const changeServiceState = vi.fn();

      await renderWithChakra(
        <Main
          isServiceEnabled={false}
          changeServiceState={changeServiceState}
          ruleSets={sampleRuleSets}
          getMatchedRule={getMatchedRule}
          optionsUrl="chrome://extensions"
        />
      );

      await expect.element(page.getByRole("checkbox")).not.toBeChecked();
    });

    test("toggle switch calls changeServiceState", async () => {
      const getMatchedRule = vi.fn().mockResolvedValue([]);
      const changeServiceState = vi.fn();

      await renderWithChakra(
        <Main
          isServiceEnabled={true}
          changeServiceState={changeServiceState}
          ruleSets={sampleRuleSets}
          getMatchedRule={getMatchedRule}
          optionsUrl="chrome://extensions"
        />
      );

      // Click on the Chakra Switch v3 element (data-scope="switch")
      const switchElement = document.querySelector('[data-scope="switch"]');
      expect(switchElement).not.toBeNull();
      await userEvent.click(switchElement!);

      expect(changeServiceState).toHaveBeenCalledTimes(1);
      expect(changeServiceState).toHaveBeenCalledWith(false);
    });

    test("getMatchedRule is called on mount", async () => {
      const getMatchedRule = vi.fn().mockResolvedValue(sampleMatchedRules);
      const changeServiceState = vi.fn();

      await renderWithChakra(
        <Main
          isServiceEnabled={true}
          changeServiceState={changeServiceState}
          ruleSets={sampleRuleSets}
          getMatchedRule={getMatchedRule}
          optionsUrl="chrome://extensions"
        />
      );

      expect(getMatchedRule).toHaveBeenCalledTimes(1);

      // Check that matched rules are displayed
      await expect.element(page.getByText("Block Ads #1")).toBeInTheDocument();
    });

    test("refresh button calls getMatchedRule again", async () => {
      const getMatchedRule = vi.fn().mockResolvedValue(sampleMatchedRules);
      const changeServiceState = vi.fn();

      await renderWithChakra(
        <Main
          isServiceEnabled={true}
          changeServiceState={changeServiceState}
          ruleSets={sampleRuleSets}
          getMatchedRule={getMatchedRule}
          optionsUrl="chrome://extensions"
        />
      );

      // Initial call on mount
      expect(getMatchedRule).toHaveBeenCalledTimes(1);

      // Click refresh button
      await page.getByRole("button", { name: /refresh/i }).click();

      // Should be called again
      expect(getMatchedRule).toHaveBeenCalledTimes(2);
    });

    test("refresh button updates displayed matched rules", async () => {
      const initialRules: MatchedRule[] = [
        {
          ruleId: 1,
          rule: { ruleSetName: "Initial", number: 1, isBlocking: true },
          timeStamp: Date.now(),
        },
      ];
      const updatedRules: MatchedRule[] = [
        {
          ruleId: 2,
          rule: { ruleSetName: "Updated", number: 2, isBlocking: false },
          timeStamp: Date.now(),
        },
      ];

      const getMatchedRule = vi
        .fn()
        .mockResolvedValueOnce(initialRules)
        .mockResolvedValueOnce(updatedRules);
      const changeServiceState = vi.fn();

      await renderWithChakra(
        <Main
          isServiceEnabled={true}
          changeServiceState={changeServiceState}
          ruleSets={sampleRuleSets}
          getMatchedRule={getMatchedRule}
          optionsUrl="chrome://extensions"
        />
      );

      // Check initial rules displayed
      await expect.element(page.getByText("Initial #1")).toBeInTheDocument();

      // Click refresh button
      await page.getByRole("button", { name: /refresh/i }).click();

      // Check updated rules displayed
      await expect.element(page.getByText("Updated #2")).toBeInTheDocument();
    });
  });

  describe("disabled service state", () => {
    test("renders with switch unchecked when service is disabled", async () => {
      const getMatchedRule = vi.fn().mockResolvedValue([]);
      const changeServiceState = vi.fn();

      await renderWithChakra(
        <div data-testid="container" style={{ width: 400, height: 250 }}>
          <Main
            isServiceEnabled={false}
            changeServiceState={changeServiceState}
            ruleSets={sampleRuleSets}
            getMatchedRule={getMatchedRule}
            optionsUrl="chrome://extensions"
          />
        </div>
      );

      await expect.element(page.getByRole("checkbox")).not.toBeChecked();

      // reset hover/focus states before screenshot
      await userEvent.unhover(page.getByRole("document"));
      await expect(page.getByTestId("container")).toMatchScreenshot(
        "Main-disabled"
      );
    });
  });
});
