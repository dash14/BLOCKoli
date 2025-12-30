import { describe, expect, test } from "vitest";
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
});
