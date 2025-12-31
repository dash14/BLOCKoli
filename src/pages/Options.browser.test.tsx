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

// Mock download function
vi.mock("@/modules/utils/download", () => ({
  download: vi.fn(),
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

  test("toggles enable state when switch is clicked", async () => {
    const changeState = vi.fn();
    mockUseRequestBlockClient.mockReturnValue(
      createMockReturnValue({ changeState, enabled: false })
    );

    await renderWithChakra(
      <div data-testid="container" style={{ width: 1024, height: 900 }}>
        <Options />
      </div>
    );

    // Get the checkbox element and simulate click (which triggers change)
    const switchCheckbox = page.getByRole("checkbox");
    const inputElement = (await switchCheckbox.element()) as HTMLInputElement;
    // Native click triggers the change event properly for checkboxes
    inputElement.click();

    expect(changeState).toHaveBeenCalledWith(true);
  });

  test("changes language when select is changed", async () => {
    const setLanguage = vi.fn();
    mockUseRequestBlockClient.mockReturnValue(
      createMockReturnValue({ setLanguage })
    );

    await renderWithChakra(
      <div data-testid="container" style={{ width: 1024, height: 900 }}>
        <Options />
      </div>
    );

    // Change language to Japanese
    await page.getByRole("combobox").selectOptions("ja");

    expect(setLanguage).toHaveBeenCalledWith("ja");
  });

  test("exports rule sets when export button is clicked", async () => {
    const performExport = vi.fn().mockResolvedValue({
      format: "BLOCKoli",
      version: 1,
      ruleSets: [{ name: "Test", rules: [] }],
    });
    mockUseRequestBlockClient.mockReturnValue(
      createMockReturnValue({ ruleSets: sampleRuleSets, performExport })
    );

    await renderWithChakra(
      <div data-testid="container" style={{ width: 1024, height: 900 }}>
        <Options />
      </div>
    );

    // Open export/import dialog
    await page.getByRole("button", { name: /import and export/i }).click();

    // Click export button
    await page.getByRole("button", { name: /^export$/i }).click();

    expect(performExport).toHaveBeenCalled();
  });

  test("imports rule sets successfully", async () => {
    const performImport = vi.fn().mockResolvedValue([true, []]);
    mockUseRequestBlockClient.mockReturnValue(
      createMockReturnValue({ ruleSets: sampleRuleSets, performImport })
    );

    await renderWithChakra(
      <div data-testid="container" style={{ width: 1024, height: 900 }}>
        <Options />
      </div>
    );

    // Open export/import dialog
    await page.getByRole("button", { name: /import and export/i }).click();
    await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();

    // Select file for import using file input
    const fileInputElement = page.getByRole("textbox");
    const fileInput = (await fileInputElement.element()) as HTMLInputElement;
    const validJson = JSON.stringify({
      format: "BLOCKoli",
      version: 1,
      ruleSets: [{ name: "Imported", rules: [] }],
    });
    const file = new File([validJson], "test.json", { type: "application/json" });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
    fileInput.dispatchEvent(new Event("change", { bubbles: true }));

    // Wait for confirmation dialog to appear
    await expect
      .element(page.getByRole("button", { name: "Import", exact: true }).nth(0))
      .toBeInTheDocument();

    // Click Import to confirm
    await page.getByRole("button", { name: "Import", exact: true }).nth(0).click();

    // Wait for import to complete
    await vi.waitFor(() => {
      expect(performImport).toHaveBeenCalled();
    });

    // Success dialog should appear
    await expect.element(page.getByText(/import succeeded/i)).toBeInTheDocument();
  });

  test("shows error dialog on import validation failure", async () => {
    const performImport = vi.fn().mockResolvedValue([
      false,
      [{ message: "invalid_format", ruleSetNumber: 0 }],
    ]);
    mockUseRequestBlockClient.mockReturnValue(
      createMockReturnValue({ ruleSets: sampleRuleSets, performImport })
    );

    await renderWithChakra(
      <div data-testid="container" style={{ width: 1024, height: 900 }}>
        <Options />
      </div>
    );

    // Open export/import dialog
    await page.getByRole("button", { name: /import and export/i }).click();
    await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();

    // Select file for import using file input
    const fileInputElement = page.getByRole("textbox");
    const fileInput = (await fileInputElement.element()) as HTMLInputElement;
    const validJson = JSON.stringify({
      format: "BLOCKoli",
      version: 1,
      ruleSets: [{ name: "Invalid", rules: [] }],
    });
    const file = new File([validJson], "test.json", { type: "application/json" });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
    fileInput.dispatchEvent(new Event("change", { bubbles: true }));

    // Wait for confirmation dialog to appear
    await expect
      .element(page.getByRole("button", { name: "Import", exact: true }).nth(0))
      .toBeInTheDocument();

    // Click Import to confirm
    await page.getByRole("button", { name: "Import", exact: true }).nth(0).click();

    // Wait for import to complete
    await vi.waitFor(() => {
      expect(performImport).toHaveBeenCalled();
    });

    // Error dialog should appear
    await expect.element(page.getByText(/import failed/i)).toBeInTheDocument();
  });

  test("shows error dialog on JSON parse error", async () => {
    const performImport = vi.fn();
    mockUseRequestBlockClient.mockReturnValue(
      createMockReturnValue({ ruleSets: sampleRuleSets, performImport })
    );

    await renderWithChakra(
      <div data-testid="container" style={{ width: 1024, height: 900 }}>
        <Options />
      </div>
    );

    // Open export/import dialog
    await page.getByRole("button", { name: /import and export/i }).click();
    await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();

    // Select file with invalid JSON using file input
    const fileInputElement = page.getByRole("textbox");
    const fileInput = (await fileInputElement.element()) as HTMLInputElement;
    const invalidJson = "{ invalid json }";
    const file = new File([invalidJson], "invalid.json", { type: "application/json" });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
    fileInput.dispatchEvent(new Event("change", { bubbles: true }));

    // Wait for confirmation dialog to appear
    await expect
      .element(page.getByRole("button", { name: "Import", exact: true }).nth(0))
      .toBeInTheDocument();

    // Click Import to confirm
    await page.getByRole("button", { name: "Import", exact: true }).nth(0).click();

    // Error dialog should appear (JSON parse error)
    await expect.element(page.getByText(/import failed/i)).toBeInTheDocument();

    // performImport should NOT have been called (parse error before import)
    expect(performImport).not.toHaveBeenCalled();
  });
});
