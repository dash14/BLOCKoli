import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { useI18n } from "@/hooks/useI18n";
import { renderWithChakra } from "@/test/utils/render";
import { InputUrlFilter } from "./InputUrlFilter";

function TestWrapper({
  isEditing,
  urlFilter,
  isRegexFilter,
}: {
  isEditing: boolean;
  urlFilter?: string;
  isRegexFilter?: boolean;
}) {
  const i18n = useI18n();
  return (
    <div data-testid="container">
      <InputUrlFilter
        isEditing={isEditing}
        urlFilter={urlFilter}
        isRegexFilter={isRegexFilter}
        onChange={() => {}}
        width={300}
        maxWidth={300}
        i18n={i18n}
      />
    </div>
  );
}

describe("InputUrlFilter component", () => {
  test("renders input in edit mode", async () => {
    await renderWithChakra(<TestWrapper isEditing={true} />);
    await expect.element(page.getByRole("textbox")).toBeInTheDocument();

    // reset hover/focus states before screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "InputUrlFilter-edit"
    );
  });

  test("renders input with regex placeholder", async () => {
    await renderWithChakra(
      <TestWrapper isEditing={true} isRegexFilter={true} />
    );
    const input = page.getByRole("textbox");
    await expect
      .element(input)
      .toHaveAttribute("placeholder", "^https?://www\\.example\\.com/api/");

    // reset hover/focus states before screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "InputUrlFilter-edit-regex"
    );
  });

  test("renders tag in view mode with filter", async () => {
    await renderWithChakra(
      <TestWrapper isEditing={false} urlFilter="||example.com^" />
    );
    await expect.element(page.getByText("||example.com^")).toBeInTheDocument();

    // reset hover/focus states before screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "InputUrlFilter-view"
    );
  });

  test("renders not specified in view mode without filter", async () => {
    await renderWithChakra(<TestWrapper isEditing={false} />);
    await expect.element(page.getByText("Not specified")).toBeInTheDocument();

    // reset hover/focus states before screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "InputUrlFilter-empty"
    );
  });
});
