import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { renderWithChakra } from "@/test/utils/render";
import { MatchedRulesTable } from "./MatchedRulesTable";

describe("MatchedRulesTable component", () => {
  test("renders empty table", async () => {
    await renderWithChakra(
      <div data-testid="container">
        <MatchedRulesTable matchedRules={[]} height="110px" />
      </div>
    );
    await expect.element(page.getByRole("table")).toBeInTheDocument();
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "MatchedRulesTable-empty"
    );
  });

  test("renders table with matched rules", async () => {
    const matchedRules = [
      {
        ruleId: 1,
        rule: { ruleSetName: "TestRuleSet", number: 1, isBlocking: true },
        timeStamp: new Date("2024-01-01T12:00:00").getTime(),
      },
      {
        ruleId: 2,
        rule: { ruleSetName: "TestRuleSet", number: 2, isBlocking: false },
        timeStamp: new Date("2024-01-01T12:01:00").getTime(),
      },
    ];
    await renderWithChakra(
      <div data-testid="container">
        <MatchedRulesTable matchedRules={matchedRules} height="110px" />
      </div>
    );
    await expect.element(page.getByText("TestRuleSet #1")).toBeInTheDocument();
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "MatchedRulesTable-with-rules"
    );
  });
});
