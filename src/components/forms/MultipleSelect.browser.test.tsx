import { describe, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { renderWithChakra } from "@/test/utils/render";
import { MultipleSelect } from "./MultipleSelect";

const options = [
  { label: "Option A", value: "a" },
  { label: "Option B", value: "b" },
  { label: "Option C", value: "c" },
];

describe("MultipleSelect component", () => {
  test("renders with placeholder", async () => {
    const onChange = vi.fn();
    await renderWithChakra(
      <div data-testid="container">
        <MultipleSelect
          placeholder="Select options..."
          options={options}
          onChange={onChange}
        />
      </div>
    );
    await expect
      .element(page.getByText("Select options..."))
      .toBeInTheDocument();

    const container = page.getByTestId("container");
    await expect(container).toMatchScreenshot("MultipleSelect-default");
  });

  test("renders with pre-selected values", async () => {
    const onChange = vi.fn();
    await renderWithChakra(
      <div data-testid="container">
        <MultipleSelect
          placeholder="Select options..."
          options={options}
          value={["a", "c"]}
          onChange={onChange}
        />
      </div>
    );
    await expect.element(page.getByText("Option A")).toBeInTheDocument();
    await expect.element(page.getByText("Option C")).toBeInTheDocument();

    const container = page.getByTestId("container");
    await expect(container).toMatchScreenshot("MultipleSelect-with-values");
  });

  test("calls onChange when selecting an option", async () => {
    const onChange = vi.fn();
    await renderWithChakra(
      <div data-testid="container">
        <MultipleSelect
          placeholder="Select options..."
          options={options}
          onChange={onChange}
        />
      </div>
    );

    // Open the dropdown
    const selectInput = page.getByRole("combobox");
    await selectInput.click();

    // Select an option
    const optionA = page.getByRole("option", { name: "Option A" });
    await optionA.click();

    expect(onChange).toHaveBeenCalledWith(["a"]);
  });

  test("sorts selected values by options order", async () => {
    const onChange = vi.fn();
    await renderWithChakra(
      <div data-testid="container">
        <MultipleSelect
          placeholder="Select options..."
          options={options}
          value={["c"]}
          onChange={onChange}
        />
      </div>
    );

    // Open the dropdown
    const selectInput = page.getByRole("combobox");
    await selectInput.click();

    // Select Option A (should be sorted before C)
    const optionA = page.getByRole("option", { name: "Option A" });
    await optionA.click();

    // Should be sorted as ["a", "c"] not ["c", "a"]
    expect(onChange).toHaveBeenCalledWith(["a", "c"]);
  });
});
