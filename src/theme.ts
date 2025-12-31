import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe,
  defineSlotRecipe,
} from "@chakra-ui/react";

const baseConfig = defineConfig({
  globalCss: {
    html: { fontSize: "16px" },
  },
  theme: {
    recipes: {
      button: defineRecipe({
        base: { colorPalette: "blue" },
      }),
      heading: defineRecipe({ base: { lineHeight: "1.2" } }),
      input: defineRecipe({ defaultVariants: { size: "sm" } }),
    },
    slotRecipes: {
      switch: defineSlotRecipe({
        variants: {
          variant: {
            solid: {
              control: {
                _checked: {
                  bg: "blue.500",
                },
                _unchecked: {
                  bg: "gray.300",
                },
              },
            },
          },
        },
        defaultVariants: {
          // @ts-expect-error -- chakra issue
          size: "lg",
        },
      }),
    },
  },
});
export const baseSystem = createSystem(defaultConfig, baseConfig);
