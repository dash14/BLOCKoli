import { Accordion } from "@chakra-ui/react";
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { renderWithChakra } from "@/test/utils/render";
import { AccordionCustomTrigger } from "./AccordionCustomTrigger";

function TestWrapper({ defaultValue = [] }: { defaultValue?: string[] }) {
  return (
    <div data-testid="container">
      <Accordion.Root defaultValue={defaultValue} multiple>
        <Accordion.Item value="0" data-testid="accordion-item">
          <AccordionCustomTrigger>
            <span data-testid="trigger-content">Trigger</span>
          </AccordionCustomTrigger>
          <Accordion.ItemContent>
            <div data-testid="content">Content</div>
          </Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
}

describe("AccordionCustomTrigger component", () => {
  test("opens accordion when clicked while collapsed", async () => {
    await renderWithChakra(<TestWrapper defaultValue={[]} />);

    // Initially collapsed - check data-state attribute
    const item = page.getByTestId("accordion-item");
    await expect.element(item).toHaveAttribute("data-state", "closed");

    // Click trigger to open
    await page.getByTestId("trigger-content").click();

    // Should now be open
    await expect.element(item).toHaveAttribute("data-state", "open");
  });

  test("closes accordion when clicked while expanded", async () => {
    await renderWithChakra(<TestWrapper defaultValue={["0"]} />);

    // Initially expanded - check data-state attribute
    const item = page.getByTestId("accordion-item");
    await expect.element(item).toHaveAttribute("data-state", "open");

    // Click trigger to close
    await page.getByTestId("trigger-content").click();

    // Should now be closed
    await expect.element(item).toHaveAttribute("data-state", "closed");
  });
});
