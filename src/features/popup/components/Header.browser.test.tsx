import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { renderWithChakra } from "@/test/utils/render";
import { Header } from "./Header";

describe("Header component", () => {
  test("renders header with brand", async () => {
    await renderWithChakra(
      <div data-testid="container">
        <Header />
      </div>
    );
    await expect
      .element(page.getByRole("heading", { level: 1 }))
      .toBeInTheDocument();
    await expect(page.getByTestId("container")).toMatchScreenshot(
      "Header-default"
    );
  });
});
