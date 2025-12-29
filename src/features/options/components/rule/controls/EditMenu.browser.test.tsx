import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { useI18n } from "@/hooks/useI18n";
import { renderWithChakra } from "@/test/utils/render";
import { EditMenu } from "./EditMenu";

function TestWrapper({
  isEditing,
  isRemoveEnabled,
}: {
  isEditing: boolean;
  isRemoveEnabled: boolean;
}) {
  const i18n = useI18n();
  return (
    <div data-testid="container">
      <EditMenu
        isEditing={isEditing}
        isRemoveEnabled={isRemoveEnabled}
        onClickEdit={() => {}}
        onClickRemove={() => {}}
        i18n={i18n}
      />
    </div>
  );
}

describe("EditMenu component", () => {
  test("renders editing tag in edit mode", async () => {
    await renderWithChakra(
      <TestWrapper isEditing={true} isRemoveEnabled={false} />
    );
    await expect.element(page.getByText("Editing")).toBeInTheDocument();

    // reset hover/focus states before screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "EditMenu-editing"
    );
  });

  test("renders edit button in view mode", async () => {
    await renderWithChakra(
      <TestWrapper isEditing={false} isRemoveEnabled={false} />
    );
    await expect
      .element(page.getByRole("button", { name: /edit/i }))
      .toBeInTheDocument();

    // reset hover/focus states before screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "EditMenu-view"
    );
  });

  test("renders menu button when remove enabled", async () => {
    await renderWithChakra(
      <TestWrapper isEditing={false} isRemoveEnabled={true} />
    );
    await expect
      .element(page.getByRole("button", { name: "more" }))
      .toBeInTheDocument();

    // reset hover/focus states before screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "EditMenu-with-menu"
    );
  });
});
