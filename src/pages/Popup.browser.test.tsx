import { beforeAll, describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { RuleActionType } from "@/modules/core/rules";
import { MatchedRule } from "@/modules/rules/matched";
import { StoredRuleSets } from "@/modules/rules/stored";
import { renderWithChakra } from "@/test/utils/render";

// Mock useRequestBlockClient before importing Popup
const mockUseRequestBlockClient = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/useRequestBlockClient", () => ({
  useRequestBlockClient: mockUseRequestBlockClient,
}));

// Mock ChromeApiFactory for optionsUrl
vi.mock("@/modules/chrome/factory", () => ({
  ChromeApiFactory: class {
    runtime() {
      return { getURL: () => "chrome://extensions/options.html" };
    }
  },
}));

import Popup from "./Popup";

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
];

const sampleMatchedRules: MatchedRule[] = [
  {
    ruleId: 1,
    rule: { ruleSetName: "Block Ads", number: 1, isBlocking: true },
    timeStamp: new Date("2024-01-01T12:00:00").getTime(),
  },
  {
    ruleId: 2,
    rule: { ruleSetName: "Allow Trusted", number: 1, isBlocking: false },
    timeStamp: new Date("2024-01-01T12:01:00").getTime(),
  },
];

// Default mock return value factory
function createMockReturnValue(
  overrides: Partial<ReturnType<typeof mockUseRequestBlockClient>> = {}
) {
  return {
    loaded: true,
    enabled: true,
    ruleSets: [] as StoredRuleSets,
    language: "en",
    changeState: vi.fn(),
    getMatchedRule: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

describe("Popup page", () => {
  beforeAll(async () => {
    await page.viewport(360, 320);
  });

  test("renders with empty rule sets", async () => {
    mockUseRequestBlockClient.mockReturnValue(createMockReturnValue());

    await renderWithChakra(
      <div data-testid="container" style={{ width: 360, height: 320 }}>
        <Popup />
      </div>
    );

    // Verify NoRules message is displayed
    await expect
      .element(page.getByText(/no rules are defined/i))
      .toBeInTheDocument();

    // VRT screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot("Popup-empty");
  });

  test("renders with rule sets", async () => {
    mockUseRequestBlockClient.mockReturnValue(
      createMockReturnValue({ ruleSets: sampleRuleSets })
    );

    await renderWithChakra(
      <div data-testid="container" style={{ width: 360, height: 320 }}>
        <Popup />
      </div>
    );

    // Verify main UI is displayed
    await expect.element(page.getByText(/enable rules/i)).toBeInTheDocument();
    await expect.element(page.getByRole("checkbox")).toBeInTheDocument();

    // VRT screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "Popup-with-rules"
    );
  });

  test("renders with service disabled", async () => {
    mockUseRequestBlockClient.mockReturnValue(
      createMockReturnValue({ ruleSets: sampleRuleSets, enabled: false })
    );

    await renderWithChakra(
      <div data-testid="container" style={{ width: 360, height: 320 }}>
        <Popup />
      </div>
    );

    // Verify switch is unchecked
    await expect.element(page.getByRole("checkbox")).not.toBeChecked();

    // VRT screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "Popup-disabled"
    );
  });

  test("renders with matched rules (block and allow)", async () => {
    mockUseRequestBlockClient.mockReturnValue(
      createMockReturnValue({
        ruleSets: sampleRuleSets,
        getMatchedRule: vi.fn().mockResolvedValue(sampleMatchedRules),
      })
    );

    await renderWithChakra(
      <div data-testid="container" style={{ width: 360, height: 320 }}>
        <Popup />
      </div>
    );

    // Verify matched rules are displayed
    await expect.element(page.getByText("Block Ads #1")).toBeInTheDocument();
    await expect
      .element(page.getByText("Allow Trusted #1"))
      .toBeInTheDocument();

    // VRT screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "Popup-with-matched-rules"
    );
  });
});
