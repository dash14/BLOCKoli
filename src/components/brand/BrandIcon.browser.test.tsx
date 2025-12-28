import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { renderWithChakra } from "@/test/utils/render";
import { BrandIcon } from "./BrandIcon";

describe("BrandIcon component", () => {
  test("renders icon image", async () => {
    await renderWithChakra(
      <div data-testid="container">
        <BrandIcon />
      </div>
    );
    const img = page.getByRole("img");
    await expect.element(img).toBeInTheDocument();

    const container = page.getByTestId("container");
    await expect(container).toMatchScreenshot("BrandIcon-default");
  });

  test("applies custom props", async () => {
    await renderWithChakra(
      <div data-testid="container">
        <BrandIcon width="64px" height="64px" />
      </div>
    );
    const img = page.getByRole("img");
    await expect.element(img).toBeInTheDocument();

    const container = page.getByTestId("container");
    await expect(container).toMatchScreenshot("BrandIcon-large");
  });
});
