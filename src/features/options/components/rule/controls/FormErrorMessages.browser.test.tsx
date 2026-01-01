import { Field } from "@chakra-ui/react";
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { useI18n } from "@/hooks/useI18n";
import { renderWithChakra } from "@/test/utils/render";
import { FormErrorMessages } from "./FormErrorMessage";

function TestWrapper({ messages }: { messages: string[] }) {
  const i18n = useI18n();
  return (
    <Field.Root invalid data-testid="container">
      <FormErrorMessages messages={messages} i18n={i18n} />
    </Field.Root>
  );
}

describe("FormErrorMessages component", () => {
  test("renders error messages", async () => {
    await renderWithChakra(<TestWrapper messages={["Error 1", "Error 2"]} />);
    await expect.element(page.getByText("Error 1")).toBeInTheDocument();
    await expect.element(page.getByText("Error 2")).toBeInTheDocument();
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "FormErrorMessages-default"
    );
  });
});
