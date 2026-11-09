import { beforeAll, describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { RuleSetsChange } from "@/features/options/hooks/useRuleSetsEdit";
import { RuleActionType } from "@/modules/core/rules";
import { SaveConflictError } from "@/modules/rules/conflict";
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
        condition: { initiatorDomains: ["trusted.example.com"] },
      },
    ],
  },
];

// Default mock return value factory
function createMockReturnValue(
  overrides: Partial<ReturnType<typeof mockUseRequestBlockClient>> = {},
) {
  return {
    loaded: true,
    loadFailed: false,
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
      </div>,
    );

    // Verify page is rendered
    await expect.element(page.getByText("Options")).toBeInTheDocument();
    await expect
      .element(page.getByText(/There are no rule sets available/i))
      .toBeInTheDocument();

    // VRT screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "Options-empty",
    );
  });

  test("hides the page until the settings are loaded", async () => {
    mockUseRequestBlockClient.mockReturnValue(
      createMockReturnValue({ loaded: false })
    );

    await renderWithChakra(<Options />);

    expect(document.querySelector(".options.loading")).not.toBeNull();
    // Hidden content is left out of the accessibility tree, so look it up in the DOM.
    const heading = Array.from(document.querySelectorAll("h1")).find(
      (h) => h.textContent === "Options"
    );
    expect(heading).toBeDefined();
    expect(getComputedStyle(heading as Element).visibility).toBe("hidden");
  });

  test("shows an error instead of the editor when the initial load fails", async () => {
    mockUseRequestBlockClient.mockReturnValue(
      createMockReturnValue({ loaded: false, loadFailed: true })
    );

    await renderWithChakra(
      <div data-testid="container" style={{ width: 1024, height: 900 }}>
        <Options />
      </div>,
    );

    expect(document.querySelector(".options.loading")).toBeNull();
    await expect
      .element(page.getByRole("alert"))
      .toHaveTextContent(
        "Could not load the settings. Close this page and open it again."
      );
    await expect.element(page.getByRole("checkbox")).not.toBeInTheDocument();
    await expect.element(page.getByRole("combobox")).not.toBeInTheDocument();
    await expect
      .element(page.getByText(/There are no rule sets available/i))
      .not.toBeInTheDocument();

    // VRT screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "Options-load-failed",
    );
  });

  test("renders with rule sets", async () => {
    mockUseRequestBlockClient.mockReturnValue(
      createMockReturnValue({ ruleSets: sampleRuleSets }),
    );

    await renderWithChakra(
      <div data-testid="container" style={{ width: 1024, height: 900 }}>
        <Options />
      </div>,
    );

    // Verify page is rendered with rule sets
    await expect.element(page.getByText("Options")).toBeInTheDocument();
    await expect.element(page.getByText("Rule Sets:")).toBeInTheDocument();
    await expect.element(page.getByText("Block Ads")).toBeInTheDocument();
    await expect.element(page.getByText("Allow Trusted")).toBeInTheDocument();

    // VRT screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "Options-with-rules",
    );
  });

  test("renders with service disabled", async () => {
    mockUseRequestBlockClient.mockReturnValue(
      createMockReturnValue({ ruleSets: sampleRuleSets, enabled: false }),
    );

    await renderWithChakra(
      <div data-testid="container" style={{ width: 1024, height: 900 }}>
        <Options />
      </div>,
    );

    // Verify switch is unchecked
    await expect.element(page.getByRole("checkbox", { name: /enable rules/i })).not.toBeChecked();

    // VRT screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "Options-disabled",
    );
  });

  test("renders add rule set form after clicking Add button", async () => {
    mockUseRequestBlockClient.mockReturnValue(createMockReturnValue());

    await renderWithChakra(
      <div data-testid="container" style={{ width: 1024, height: 900 }}>
        <Options />
      </div>,
    );

    // Click "Add a Rule Set" button
    await page.getByRole("button", { name: /add a rule set/i }).click();

    // Verify new rule set is added with edit form
    await expect.element(page.getByText("My Rule Set 1")).toBeInTheDocument();
    await expect.element(page.getByText("Editing")).toBeInTheDocument();

    // VRT screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "Options-add-ruleset-form",
    );
  });

  test("closes the rule editor once the save succeeds", async () => {
    const updateRuleSets = vi.fn(async (change: RuleSetsChange) => change([]));
    mockUseRequestBlockClient.mockReturnValue(
      createMockReturnValue({ updateRuleSets })
    );

    await renderWithChakra(<Options />);

    await page.getByRole("button", { name: /add a rule set/i }).click();
    await page
      .getByRole("textbox", { name: "Request Domains" })
      .fill("typed.example.com");
    await page.getByRole("button", { name: "Save" }).click();

    await expect
      .element(page.getByRole("button", { name: "Save" }))
      .not.toBeInTheDocument();
    expect(updateRuleSets).toHaveBeenCalledTimes(1);
    expect(page.getByRole("alertdialog").query()).toBeNull();
  });

  const conflictMessage =
    "It was changed in another tab, so your change was not saved. Check the latest content and try again.";
  for (const [rejection, shown] of [
    [new Error("Too many rules: 501, but at most 500 can be defined"), "Too many rules: 501, but at most 500 can be defined"],
    ["Rejected", "Rejected"],
    [new SaveConflictError(), conflictMessage],
  ] as const) {
    test(`shows why a save was rejected and keeps the rule being edited (${shown})`, async () => {
      const updateRuleSets = vi.fn().mockRejectedValue(rejection);
      mockUseRequestBlockClient.mockReturnValue(
        createMockReturnValue({ updateRuleSets })
      );

      await renderWithChakra(<Options />);

      await page.getByRole("button", { name: /add a rule set/i }).click();
      const requestDomains = page.getByRole("textbox", {
        name: "Request Domains",
      });
      await requestDomains.fill("typed.example.com");
      await page.getByRole("button", { name: "Save" }).click();

      const dialog = page.getByRole("alertdialog");
      await expect.element(dialog.getByText("Save failed")).toBeVisible();
      await expect.element(dialog.getByText(shown)).toBeVisible();
      expect(updateRuleSets).toHaveBeenCalledTimes(1);

      await dialog.getByRole("button", { name: "Close" }).click();
      await expect.element(dialog).not.toBeInTheDocument();
      await expect.element(requestDomains).toHaveValue("typed.example.com");
      await expect
        .element(page.getByRole("button", { name: "Save" }))
        .toBeEnabled();
    });
  }

  test("renders with accordion opened", async () => {
    mockUseRequestBlockClient.mockReturnValue(
      createMockReturnValue({ ruleSets: sampleRuleSets }),
    );

    await renderWithChakra(
      <div data-testid="container" style={{ width: 1024, height: 900 }}>
        <Options />
      </div>,
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
      "Options-accordion-open",
    );
  });

  test("toggles enable state when switch is clicked", async () => {
    const changeState = vi.fn();
    mockUseRequestBlockClient.mockReturnValue(
      createMockReturnValue({ changeState, enabled: false }),
    );

    await renderWithChakra(
      <div data-testid="container" style={{ width: 1024, height: 900 }}>
        <Options />
      </div>,
    );

    // In Chakra v3, click on the Switch control element
    const switchControl = document.querySelector(
      '[data-scope="switch"][data-part="control"]',
    );
    expect(switchControl).not.toBeNull();
    await userEvent.click(switchControl!);

    expect(changeState).toHaveBeenCalledWith(true);
  });

  test("changes language when select is changed", async () => {
    const setLanguage = vi.fn();
    mockUseRequestBlockClient.mockReturnValue(
      createMockReturnValue({ setLanguage }),
    );

    await renderWithChakra(
      <div data-testid="container" style={{ width: 1024, height: 900 }}>
        <Options />
      </div>,
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
      createMockReturnValue({ ruleSets: sampleRuleSets, performExport }),
    );

    await renderWithChakra(
      <div data-testid="container" style={{ width: 1024, height: 900 }}>
        <Options />
      </div>,
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
      createMockReturnValue({ ruleSets: sampleRuleSets, performImport }),
    );

    await renderWithChakra(
      <div data-testid="container" style={{ width: 1024, height: 900 }}>
        <Options />
      </div>,
    );

    // Open export/import dialog
    await page.getByRole("button", { name: /import and export/i }).click();
    await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();

    // Select file for import using file input
    const fileInput =
      document.querySelector<HTMLInputElement>('input[type="file"]')!;
    const validJson = JSON.stringify({
      format: "BLOCKoli",
      version: 1,
      ruleSets: [{ name: "Imported", rules: [] }],
    });
    const file = new File([validJson], "test.json", {
      type: "application/json",
    });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
    fileInput.dispatchEvent(new Event("change", { bubbles: true }));

    // Wait for confirmation dialog to appear
    await expect
      .element(page.getByRole("button", { name: "Import", exact: true }).nth(0))
      .toBeInTheDocument();

    // Click Import to confirm
    await page
      .getByRole("button", { name: "Import", exact: true })
      .nth(0)
      .click();

    // Wait for import to complete
    await vi.waitFor(() => {
      expect(performImport).toHaveBeenCalled();
    });

    // Success dialog should appear
    await expect
      .element(page.getByText(/import succeeded/i))
      .toBeInTheDocument();
  });

  test("shows error dialog on import validation failure", async () => {
    const performImport = vi
      .fn()
      .mockResolvedValue([
        false,
        [{ message: "invalid_format", ruleSetNumber: 0 }],
      ]);
    mockUseRequestBlockClient.mockReturnValue(
      createMockReturnValue({ ruleSets: sampleRuleSets, performImport }),
    );

    await renderWithChakra(
      <div data-testid="container" style={{ width: 1024, height: 900 }}>
        <Options />
      </div>,
    );

    // Open export/import dialog
    await page.getByRole("button", { name: /import and export/i }).click();
    await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();

    // Select file for import using file input
    const fileInput =
      document.querySelector<HTMLInputElement>('input[type="file"]')!;
    const validJson = JSON.stringify({
      format: "BLOCKoli",
      version: 1,
      ruleSets: [{ name: "Invalid", rules: [] }],
    });
    const file = new File([validJson], "test.json", {
      type: "application/json",
    });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
    fileInput.dispatchEvent(new Event("change", { bubbles: true }));

    // Wait for confirmation dialog to appear
    await expect
      .element(page.getByRole("button", { name: "Import", exact: true }).nth(0))
      .toBeInTheDocument();

    // Click Import to confirm
    await page
      .getByRole("button", { name: "Import", exact: true })
      .nth(0)
      .click();

    // Wait for import to complete
    await vi.waitFor(() => {
      expect(performImport).toHaveBeenCalled();
    });

    // Error dialog should appear
    await expect.element(page.getByText(/import failed/i)).toBeInTheDocument();
  });

  test.each([
    // The service worker sends errors back as strings
    ["a string", "Error: Failed to update dynamic rules"],
    // Raised in the page itself, e.g. when the service worker does not answer
    ["an Error", new Error("Failed to update dynamic rules")],
  ])("shows error dialog when import throws %s", async (_, error) => {
    const performImport = vi.fn().mockRejectedValue(error);
    mockUseRequestBlockClient.mockReturnValue(
      createMockReturnValue({ ruleSets: sampleRuleSets, performImport }),
    );

    await renderWithChakra(
      <div data-testid="container" style={{ width: 1024, height: 900 }}>
        <Options />
      </div>,
    );

    // Open export/import dialog
    await page.getByRole("button", { name: /import and export/i }).click();
    await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();

    // Select file for import using file input
    const fileInput =
      document.querySelector<HTMLInputElement>('input[type="file"]')!;
    const validJson = JSON.stringify({
      format: "BLOCKoli",
      version: 1,
      ruleSets: [{ name: "Imported", rules: [] }],
    });
    const file = new File([validJson], "test.json", {
      type: "application/json",
    });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
    fileInput.dispatchEvent(new Event("change", { bubbles: true }));

    // Wait for confirmation dialog to appear
    await expect
      .element(page.getByRole("button", { name: "Import", exact: true }).nth(0))
      .toBeInTheDocument();

    // Click Import to confirm
    await page
      .getByRole("button", { name: "Import", exact: true })
      .nth(0)
      .click();

    // Error dialog should appear with the thrown message
    await expect.element(page.getByText(/import failed/i)).toBeInTheDocument();
    await expect
      .element(page.getByText(/Failed to update dynamic rules/))
      .toBeInTheDocument();
  });

  test("passes JSON holding null to the import and shows its errors", async () => {
    const performImport = vi
      .fn()
      .mockResolvedValue([false, [{ message: "The format is incorrect" }]]);
    mockUseRequestBlockClient.mockReturnValue(
      createMockReturnValue({ ruleSets: sampleRuleSets, performImport }),
    );

    await renderWithChakra(
      <div data-testid="container" style={{ width: 1024, height: 900 }}>
        <Options />
      </div>,
    );

    // Open export/import dialog
    await page.getByRole("button", { name: /import and export/i }).click();
    await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();

    // Select a file whose JSON is null
    const fileInput =
      document.querySelector<HTMLInputElement>('input[type="file"]')!;
    const file = new File(["null"], "null.json", { type: "application/json" });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
    fileInput.dispatchEvent(new Event("change", { bubbles: true }));

    // Click Import to confirm
    await expect
      .element(page.getByRole("button", { name: "Import", exact: true }).nth(0))
      .toBeInTheDocument();
    await page
      .getByRole("button", { name: "Import", exact: true })
      .nth(0)
      .click();

    await expect.element(page.getByText(/import failed/i)).toBeInTheDocument();
    await expect
      .element(page.getByText(/The format is incorrect/))
      .toBeInTheDocument();
    expect(performImport).toHaveBeenCalledWith(null);
  });

  test("shows error dialog on JSON parse error", async () => {
    const performImport = vi.fn();
    mockUseRequestBlockClient.mockReturnValue(
      createMockReturnValue({ ruleSets: sampleRuleSets, performImport }),
    );

    await renderWithChakra(
      <div data-testid="container" style={{ width: 1024, height: 900 }}>
        <Options />
      </div>,
    );

    // Open export/import dialog
    await page.getByRole("button", { name: /import and export/i }).click();
    await expect.element(page.getByRole("alertdialog")).toBeInTheDocument();

    // Select file with invalid JSON using file input
    const fileInput =
      document.querySelector<HTMLInputElement>('input[type="file"]')!;
    const invalidJson = "{ invalid json }";
    const file = new File([invalidJson], "invalid.json", {
      type: "application/json",
    });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
    fileInput.dispatchEvent(new Event("change", { bubbles: true }));

    // Wait for confirmation dialog to appear
    await expect
      .element(page.getByRole("button", { name: "Import", exact: true }).nth(0))
      .toBeInTheDocument();

    // Click Import to confirm
    await page
      .getByRole("button", { name: "Import", exact: true })
      .nth(0)
      .click();

    // Error dialog should appear (JSON parse error)
    await expect.element(page.getByText(/import failed/i)).toBeInTheDocument();

    // performImport should NOT have been called (parse error before import)
    expect(performImport).not.toHaveBeenCalled();
  });
});
