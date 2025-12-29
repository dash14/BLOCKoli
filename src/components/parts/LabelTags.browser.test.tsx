import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { renderWithChakra } from "@/test/utils/render";
import { LabelTags } from "./LabelTags";

const options = [
  { label: "Label A", value: "a" },
  { label: "Label B", value: "b" },
  { label: "Label C", value: "c" },
];

describe("LabelTags component", () => {
  test("renders tags for selected values", async () => {
    await renderWithChakra(
      <div data-testid="container">
        <LabelTags
          empty="No selection"
          options={options}
          values={["a", "c"]}
          maxWidth={300}
        />
      </div>
    );
    await expect.element(page.getByText("Label A")).toBeInTheDocument();
    await expect.element(page.getByText("Label C")).toBeInTheDocument();

    const container = page.getByTestId("container");
    await expect(container).toMatchScreenshot("LabelTags-with-values");
  });

  test("renders empty text when no values selected", async () => {
    await renderWithChakra(
      <div data-testid="container">
        <LabelTags
          empty="No selection"
          options={options}
          values={[]}
          maxWidth={300}
        />
      </div>
    );
    await expect.element(page.getByText("No selection")).toBeInTheDocument();

    const container = page.getByTestId("container");
    await expect(container).toMatchScreenshot("LabelTags-empty");
  });
});
