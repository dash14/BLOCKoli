import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { renderWithChakra } from "@/test/utils/render";
import { Brand } from "./Brand";

describe("Brand component", () => {
  test("renders BLOCK and oli text", async () => {
    await renderWithChakra(
      <div data-testid="container">
        <Brand />
      </div>
    );
    await expect.element(page.getByText("BLOCK")).toBeInTheDocument();
    await expect.element(page.getByText("oli")).toBeInTheDocument();

    const container = page.getByTestId("container");
    await expect(container).toMatchScreenshot("Brand-default");
  });

  test("applies custom props", async () => {
    await renderWithChakra(
      <div data-testid="container">
        <Brand as="h1" fontSize="4xl" />
      </div>
    );
    const heading = page.getByRole("heading", { level: 1 });
    await expect.element(heading).toBeInTheDocument();

    const container = page.getByTestId("container");
    await expect(container).toMatchScreenshot("Brand-large");
  });
});
