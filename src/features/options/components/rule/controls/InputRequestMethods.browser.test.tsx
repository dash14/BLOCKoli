import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { useI18n } from "@/hooks/useI18n";
import { RequestMethod } from "@/modules/core/rules";
import { renderWithChakra } from "@/test/utils/render";
import { InputRequestMethods } from "./InputRequestMethods";

function TestWrapper({
  isEditing,
  methods,
}: {
  isEditing: boolean;
  methods?: RequestMethod[];
}) {
  const i18n = useI18n();
  return (
    <div data-testid="container">
      <InputRequestMethods
        isEditing={isEditing}
        requestMethods={methods}
        onChange={() => {}}
        width={300}
        maxWidth={300}
        i18n={i18n}
      />
    </div>
  );
}

describe("InputRequestMethods component", () => {
  test("renders select in edit mode", async () => {
    await renderWithChakra(<TestWrapper isEditing={true} />);
    await expect.element(page.getByText("ALL")).toBeInTheDocument();

    // reset hover/focus states before screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "InputRequestMethods-edit"
    );
  });

  test("renders tags in view mode with methods", async () => {
    await renderWithChakra(
      <TestWrapper
        isEditing={false}
        methods={[RequestMethod.GET, RequestMethod.POST]}
      />
    );
    await expect.element(page.getByText("GET")).toBeInTheDocument();

    // reset hover/focus states before screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "InputRequestMethods-view"
    );
  });

  test("renders all in view mode without methods", async () => {
    await renderWithChakra(<TestWrapper isEditing={false} />);
    await expect.element(page.getByText("ALL")).toBeInTheDocument();

    // reset hover/focus states before screenshot
    await userEvent.unhover(page.getByRole("document"));
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "InputRequestMethods-empty"
    );
  });
});
