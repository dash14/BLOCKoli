import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { renderWithChakra } from "@/test/utils/render";
import { ExternalLink } from "./ExternalLink";

describe("ExternalLink component", () => {
  test("renders link with external icon", async () => {
    await renderWithChakra(
      <div data-testid="container">
        <ExternalLink href="https://example.com">Example Site</ExternalLink>
      </div>
    );
    const link = page.getByRole("link", { name: /Example Site/ });
    await expect.element(link).toBeInTheDocument();
    await expect.element(link).toHaveAttribute("href", "https://example.com");
    await expect.element(link).toHaveAttribute("target", "_blank");
    await expect.element(link).toHaveAttribute("rel", "noopener");

    const container = page.getByTestId("container");
    await expect(container).toMatchScreenshot("ExternalLink-default");
  });
});
