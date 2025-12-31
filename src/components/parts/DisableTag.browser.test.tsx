import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { renderWithChakra } from "@/test/utils/render";
import { DisableTag } from "./DisableTag";

describe("DisableTag component", () => {
  test("renders children text", async () => {
    await renderWithChakra(
      <div data-testid="container">
        <DisableTag>Disabled</DisableTag>
      </div>
    );
    await expect.element(page.getByText("Disabled")).toBeInTheDocument();

    const container = page.getByTestId("container");
    await expect(container).toMatchScreenshot("DisableTag-default");
  });
});
