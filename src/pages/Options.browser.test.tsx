import { beforeAll, describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { RuleActionType } from "@/modules/core/rules";
import { StoredRuleSets } from "@/modules/rules/stored";
import { renderWithChakra } from "@/test/utils/render";

// Mock useRequestBlockClient before importing Options
const mockUseRequestBlockClient = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/useRequestBlockClient", () => ({
  useRequestBlockClient: mockUseRequestBlockClient,
}));

import Options from "./Options";

// Test data
const sampleRuleSets: StoredRuleSets = [
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
        condition: { initiatorDomains: ["trusted.example.com"] },
      },
    ],
  },
];

// Default mock return value factory
function createMockReturnValue(overrides: Partial<ReturnType<typeof mockUseRequestBlockClient>> = {}) {
  return {
    loaded: true,
    enabled: true,
    ruleSets: [] as StoredRuleSets,
    language: "en",
    changeState: vi.fn(),
    updateRuleSets: vi.fn(),
    setLanguage: vi.fn(),
    performExport: vi.fn(),
    performImport: vi.fn(),
    ...overrides,
  };
}

describe("Options page", () => {
  beforeAll(async () => {
    await page.viewport(1024, 900);
  });

  test("renders with empty rule sets", async () => {
    mockUseRequestBlockClient.mockReturnValue(createMockReturnValue());

    await renderWithChakra(
      <div data-testid="container" style={{ width: 1024, height: 900 }}>
        <Options />
      </div>
    );

    // Verify page is rendered
    await expect.element(page.getByText("Options")).toBeInTheDocument();
    await expect
      .element(page.getByText(/There are no rule sets available/i))
      .toBeInTheDocument();

    // VRT screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "Options-empty"
    );
  });

  test("renders with rule sets", async () => {
    mockUseRequestBlockClient.mockReturnValue(
      createMockReturnValue({ ruleSets: sampleRuleSets })
    );

    await renderWithChakra(
      <div data-testid="container" style={{ width: 1024, height: 900 }}>
        <Options />
      </div>
    );

    // Verify page is rendered with rule sets
    await expect.element(page.getByText("Options")).toBeInTheDocument();
    await expect.element(page.getByText("Rule Sets:")).toBeInTheDocument();
    await expect.element(page.getByText("Block Ads")).toBeInTheDocument();
    await expect.element(page.getByText("Allow Trusted")).toBeInTheDocument();

    // VRT screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "Options-with-rules"
    );
  });

  test("renders with service disabled", async () => {
    mockUseRequestBlockClient.mockReturnValue(
      createMockReturnValue({ ruleSets: sampleRuleSets, enabled: false })
    );

    await renderWithChakra(
      <div data-testid="container" style={{ width: 1024, height: 900 }}>
        <Options />
      </div>
    );

    // Verify switch is unchecked
    await expect.element(page.getByRole("checkbox")).not.toBeChecked();

    // VRT screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "Options-disabled"
    );
  });

  test("renders add rule set form after clicking Add button", async () => {
    mockUseRequestBlockClient.mockReturnValue(createMockReturnValue());

    await renderWithChakra(
      <div data-testid="container" style={{ width: 1024, height: 900 }}>
        <Options />
      </div>
    );

    // Click "Add a Rule Set" button
    await page.getByRole("button", { name: /add a rule set/i }).click();

    // Verify new rule set is added with edit form
    await expect.element(page.getByText("My Rule Set 1")).toBeInTheDocument();
    await expect.element(page.getByText("Editing")).toBeInTheDocument();

    // VRT screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "Options-add-ruleset-form"
    );
  });

  test("renders with accordion opened", async () => {
    mockUseRequestBlockClient.mockReturnValue(
      createMockReturnValue({ ruleSets: sampleRuleSets })
    );

    await renderWithChakra(
      <div data-testid="container" style={{ width: 1024, height: 900 }}>
        <Options />
      </div>
    );

    // Click first rule set title to open accordion
    await page.getByText("Block Ads").first().click();

    // Verify accordion is opened and rule content is visible
    await expect
      .element(page.getByText("ads.example.com", { exact: true }))
      .toBeInTheDocument();

    // VRT screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "Options-accordion-open"
    );
  });
});
