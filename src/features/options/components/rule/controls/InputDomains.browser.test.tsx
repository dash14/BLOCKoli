import { useState } from "react";
import { describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { useI18n } from "@/hooks/useI18n";
import { renderWithChakra } from "@/test/utils/render";
import { InputDomains } from "./InputDomains";

function TestWrapper({
  isEditing,
  domains,
}: {
  isEditing: boolean;
  domains?: string[];
}) {
  const i18n = useI18n();
  return (
    <div data-testid="container">
      <InputDomains
        isEditing={isEditing}
        domains={domains}
        onChange={() => {}}
        width={300}
        maxWidth={300}
        i18n={i18n}
      />
    </div>
  );
}

// Wrapper that allows toggling isEditing state
function ToggleableWrapper({
  initialIsEditing,
  initialDomains,
  updatedDomains,
}: {
  initialIsEditing: boolean;
  initialDomains: string[];
  updatedDomains: string[];
}) {
  const i18n = useI18n();
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [domains, setDomains] = useState(initialDomains);

  return (
    <div data-testid="container">
      <button
        data-testid="toggle-edit"
        onClick={() => {
          if (isEditing) {
            // Switching to view mode - update domains
            setDomains(updatedDomains);
          }
          setIsEditing(!isEditing);
        }}
      >
        Toggle
      </button>
      <InputDomains
        isEditing={isEditing}
        domains={domains}
        onChange={() => {}}
        width={300}
        maxWidth={300}
        i18n={i18n}
      />
    </div>
  );
}

describe("InputDomains component", () => {
  test("renders input in edit mode", async () => {
    await renderWithChakra(
      <TestWrapper isEditing={true} domains={["example.com"]} />
    );
    await expect.element(page.getByRole("textbox")).toBeInTheDocument();

    // reset hover/focus states before screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "InputDomains-edit"
    );
  });

  test("renders tags in view mode with domains", async () => {
    await renderWithChakra(
      <TestWrapper isEditing={false} domains={["example.com", "test.com"]} />
    );
    await expect.element(page.getByText("example.com")).toBeInTheDocument();

    // reset hover/focus states before screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "InputDomains-view"
    );
  });

  test("renders not specified in view mode without domains", async () => {
    await renderWithChakra(<TestWrapper isEditing={false} />);
    await expect.element(page.getByText("Not specified")).toBeInTheDocument();

    // reset hover/focus states before screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "InputDomains-empty"
    );
  });

  test("calls onChange with parsed domains when input changes", async () => {
    const onChange = vi.fn();
    const i18n = { NotSpecified: "Not specified" };

    await renderWithChakra(
      <InputDomains
        isEditing={true}
        domains={[]}
        onChange={onChange}
        width={300}
        maxWidth={300}
        i18n={i18n}
      />
    );

    const input = page.getByRole("textbox");
    await input.fill("example.com, test.com, ,  another.com  ");

    expect(onChange).toHaveBeenCalledWith([
      "example.com",
      "test.com",
      "another.com",
    ]);
  });

  test("syncs domains to text when entering edit mode", async () => {
    // Use ToggleableWrapper to maintain state across mode changes
    await renderWithChakra(
      <ToggleableWrapper
        initialIsEditing={true}
        initialDomains={[]}
        updatedDomains={["synced.com"]}
      />
    );

    // Verify initial empty state in edit mode
    await expect.element(page.getByRole("textbox")).toHaveValue("");

    // User types some text (modifying domainsText)
    const input = page.getByRole("textbox");
    await input.fill("typed.com");
    await expect.element(input).toHaveValue("typed.com");

    // Toggle to view mode (domains will be updated to ["synced.com"])
    await page.getByTestId("toggle-edit").click();

    // Verify view mode shows the new domain
    await expect.element(page.getByText("synced.com")).toBeInTheDocument();

    // Toggle back to edit mode - useEffect should sync domainsText to match domains
    await page.getByTestId("toggle-edit").click();

    // Input should now show synced domains (not the old "typed.com")
    await expect.element(page.getByRole("textbox")).toHaveValue("synced.com");
  });
});
