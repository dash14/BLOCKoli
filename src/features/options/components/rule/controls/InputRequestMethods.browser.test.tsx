import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
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
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "InputRequestMethods-edit"
    );
  });

  test("renders tags in view mode with methods", async () => {
    await renderWithChakra(
      <TestWrapper isEditing={false} methods={["get", "post"]} />
    );
    await expect.element(page.getByText("GET")).toBeInTheDocument();
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "InputRequestMethods-view"
    );
  });

  test("renders all in view mode without methods", async () => {
    await renderWithChakra(<TestWrapper isEditing={false} />);
    await expect.element(page.getByText("ALL")).toBeInTheDocument();
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "InputRequestMethods-empty"
    );
  });
});
