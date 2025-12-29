import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { useI18n } from "@/hooks/useI18n";
import { ResourceType } from "@/modules/core/rules";
import { renderWithChakra } from "@/test/utils/render";
import { InputResourceTypes } from "./InputResourceTypes";

function TestWrapper({
  isEditing,
  types,
}: {
  isEditing: boolean;
  types?: ResourceType[];
}) {
  const i18n = useI18n();
  return (
    <div data-testid="container">
      <InputResourceTypes
        isEditing={isEditing}
        resourceTypes={types}
        onChange={() => {}}
        width={300}
        maxWidth={300}
        i18n={i18n}
      />
    </div>
  );
}

describe("InputResourceTypes component", () => {
  test("renders select in edit mode", async () => {
    await renderWithChakra(<TestWrapper isEditing={true} />);
    await expect.element(page.getByText("ALL")).toBeInTheDocument();

    // reset hover/focus states before screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "InputResourceTypes-edit"
    );
  });

  test("renders tags in view mode with types", async () => {
    await renderWithChakra(
      <TestWrapper
        isEditing={false}
        types={[ResourceType.SCRIPT, ResourceType.IMAGE]}
      />
    );
    await expect.element(page.getByText("script")).toBeInTheDocument();

    // reset hover/focus states before screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "InputResourceTypes-view"
    );
  });

  test("renders all in view mode without types", async () => {
    await renderWithChakra(<TestWrapper isEditing={false} />);
    await expect.element(page.getByText("ALL")).toBeInTheDocument();

    // reset hover/focus states before screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "InputResourceTypes-empty"
    );
  });
});
