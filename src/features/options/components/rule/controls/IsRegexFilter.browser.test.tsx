import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { useI18n } from "@/hooks/useI18n";
import { renderWithChakra } from "@/test/utils/render";
import { IsRegexFilter } from "./IsRegexFilter";

function TestWrapper({
  isEditing,
  isRegexFilter,
  urlFilter,
}: {
  isEditing: boolean;
  isRegexFilter?: boolean;
  urlFilter?: string;
}) {
  const i18n = useI18n();
  return (
    <div data-testid="container">
      <IsRegexFilter
        isEditing={isEditing}
        isRegexFilter={isRegexFilter}
        urlFilter={urlFilter}
        onChange={() => {}}
        i18n={i18n}
      />
    </div>
  );
}

describe("IsRegexFilter component", () => {
  test("renders checkbox in edit mode", async () => {
    await renderWithChakra(<TestWrapper isEditing={true} />);
    await expect.element(page.getByRole("checkbox")).toBeInTheDocument();
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "IsRegexFilter-edit"
    );
  });

  test("renders checked checkbox when regex enabled", async () => {
    await renderWithChakra(<TestWrapper isEditing={true} isRegexFilter={true} />);
    await expect.element(page.getByRole("checkbox")).toBeChecked();
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "IsRegexFilter-edit-checked"
    );
  });

  test("renders text in view mode when regex and filter set", async () => {
    await renderWithChakra(
      <TestWrapper isEditing={false} isRegexFilter={true} urlFilter="test" />
    );
    await expect.element(page.getByText(/Use regex/i)).toBeInTheDocument();
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "IsRegexFilter-view"
    );
  });

  test("renders nothing in view mode when regex false", async () => {
    await renderWithChakra(
      <TestWrapper isEditing={false} isRegexFilter={false} urlFilter="test" />
    );
    const container = page.getByTestId("container");
    await expect(container.element().textContent).toBe("");
  });
});
