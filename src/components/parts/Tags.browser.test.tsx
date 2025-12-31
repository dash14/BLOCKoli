import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { renderWithChakra } from "@/test/utils/render";
import { Tags } from "./Tags";

describe("Tags component", () => {
  test("renders tags with values", async () => {
    await renderWithChakra(
      <div data-testid="container">
        <Tags empty="No tags" values={["Tag A", "Tag B", "Tag C"]} maxWidth={300} />
      </div>
    );
    await expect.element(page.getByText("Tag A")).toBeInTheDocument();
    await expect.element(page.getByText("Tag B")).toBeInTheDocument();
    await expect.element(page.getByText("Tag C")).toBeInTheDocument();

    const container = page.getByTestId("container");
    await expect(container).toMatchScreenshot("Tags-with-values");
  });

  test("renders empty text when no values", async () => {
    await renderWithChakra(
      <div data-testid="container">
        <Tags empty="No tags" values={[]} maxWidth={300} />
      </div>
    );
    await expect.element(page.getByText("No tags")).toBeInTheDocument();

    const container = page.getByTestId("container");
    await expect(container).toMatchScreenshot("Tags-empty");
  });

  test("truncates width when tags exceed maxWidth", async () => {
    // Use very small maxWidth to trigger the break condition
    await renderWithChakra(
      <div data-testid="container">
        <Tags
          empty="No tags"
          values={["LongTagName1", "LongTagName2", "LongTagName3"]}
          maxWidth={50}
        />
      </div>
    );

    // All tags should still be rendered (just container width is truncated)
    await expect.element(page.getByText("LongTagName1")).toBeInTheDocument();
    await expect.element(page.getByText("LongTagName2")).toBeInTheDocument();
    await expect.element(page.getByText("LongTagName3")).toBeInTheDocument();

    const container = page.getByTestId("container");
    await expect(container).toMatchScreenshot("Tags-truncated");
  });
});
