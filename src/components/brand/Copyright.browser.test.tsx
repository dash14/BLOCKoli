import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { renderWithChakra } from "@/test/utils/render";
import { Copyright } from "./Copyright";

describe("Copyright component", () => {
  test("renders copyright text and GitHub link", async () => {
    await renderWithChakra(
      <div data-testid="container">
        <Copyright />
      </div>
    );
    await expect.element(page.getByText("© dash14.ack")).toBeInTheDocument();
    const link = page.getByRole("link");
    await expect.element(link).toBeInTheDocument();
    await expect.element(link).toHaveAttribute(
      "href",
      "https://github.com/dash14/BLOCKoli"
    );

    const container = page.getByTestId("container");
    await expect(container).toMatchScreenshot("Copyright-default");
  });
});
