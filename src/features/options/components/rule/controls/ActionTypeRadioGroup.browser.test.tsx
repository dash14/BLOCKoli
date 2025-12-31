import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { useI18n } from "@/hooks/useI18n";
import { RuleActionType } from "@/modules/core/rules";
import { renderWithChakra } from "@/test/utils/render";
import { ActionTypeRadioGroup } from "./ActionTypeRadioGroup";

function TestWrapper({
  isEditing,
  actionType,
}: {
  isEditing: boolean;
  actionType: RuleActionType;
}) {
  const i18n = useI18n();
  return (
    <div data-testid="container">
      <ActionTypeRadioGroup
        isEditing={isEditing}
        actionType={actionType}
        onChange={() => {}}
        i18n={i18n}
      />
    </div>
  );
}

describe("ActionTypeRadioGroup component", () => {
  test("renders block type in view mode", async () => {
    await renderWithChakra(
      <TestWrapper isEditing={false} actionType={RuleActionType.BLOCK} />
    );
    await expect.element(page.getByText("Block")).toBeInTheDocument();
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "ActionTypeRadioGroup-view-block"
    );
  });

  test("renders allow type in view mode", async () => {
    await renderWithChakra(
      <TestWrapper isEditing={false} actionType={RuleActionType.ALLOW} />
    );
    await expect.element(page.getByText("Allow")).toBeInTheDocument();
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "ActionTypeRadioGroup-view-allow"
    );
  });

  test("renders radio group in edit mode", async () => {
    await renderWithChakra(
      <TestWrapper isEditing={true} actionType={RuleActionType.BLOCK} />
    );
    await expect
      .element(page.getByRole("radio", { name: /block/i }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("radio", { name: /allow/i }))
      .toBeInTheDocument();
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "ActionTypeRadioGroup-edit"
    );
  });
});
