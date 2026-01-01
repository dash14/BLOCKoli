import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe,
  defineSlotRecipe,
} from "@chakra-ui/react";
import {
  accordionAnatomy,
  checkboxAnatomy,
  dialogAnatomy,
  editableAnatomy,
  fieldAnatomy,
  listAnatomy,
  popoverAnatomy,
  switchAnatomy,
  tagAnatomy,
} from "@chakra-ui/react/anatomy";

const buttonRecipe = defineRecipe({
  base: {
    colorPalette: "blue",
    fontWeight: "var(--chakra-font-weights-semibold)",
  },
  variants: {
    variant: {
      solid: {
        bg: "colorPalette.500",
      },
      ghost: {
        color: "colorPalette.600",
        _hover: { bg: "colorPalette.50" },
        _active: {
          bg: "colorPalette.100",
          _hover: { bg: "colorPalette.100" },
        },
        _focusVisible: {
          outlineColor: "colorPalette.300",
          outlineWidth: "3px",
          outlineOffset: "0",
        },
      },
      outline: {
        color: "colorPalette.600",
        _hover: { bg: "colorPalette.50" },
        _active: {
          bg: "colorPalette.100",
          _hover: { bg: "colorPalette.100" },
        },
        _focusVisible: {
          outlineColor: "colorPalette.300",
          outlineWidth: "3px",
          outlineOffset: "0",
        },
      },
    },
    size: {
      sm: {
        height: "var(--chakra-sizes-8)",
        paddingInline: "var(--chakra-spacing-3)",
      },
      md: {
        height: "var(--chakra-sizes-8)",
        paddingInline: "var(--chakra-spacing-3)",
      },
    },
  },
});

const inputRecipe = defineRecipe({
  variants: {
    size: {
      sm: {
        height: "2rem",
        _focusVisible: {
          focusRingColor: "blue.500",
        },
      },
    },
  },
  defaultVariants: { size: "sm" },
});

const switchSlotRecipe = defineSlotRecipe({
  slots: switchAnatomy.keys(),
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
});

const editableSlotRecipe = defineSlotRecipe({
  slots: editableAnatomy.keys(),
  base: {
    root: {
      colorPalette: "blue",
    },
    input: {
      focusRingWidth: "1px",
    },
  },
});

export const popoverSlotRecipe = defineSlotRecipe({
  slots: popoverAnatomy.keys(),
  base: {
    header: {
      borderBottomWidth: "1px",
      paddingInline: "var(--chakra-spacing-4)",
      paddingTop: "var(--chakra-spacing-3)",
      paddingBottom: "var(--chakra-spacing-3)",
    },
  },
});

export const accordionSlotRecipe = defineSlotRecipe({
  slots: accordionAnatomy.keys(),
  base: {
    itemContent: {
      paddingTop: "2",
      paddingBottom: "5",
    },
  },
});

const fieldSlotRecipe = defineSlotRecipe({
  slots: fieldAnatomy.keys(),
  base: {
    root: {
      gap: "0",
    },
    label: {
      userSelect: "text",
    },
  },
});

const tagSlotRecipe = defineSlotRecipe({
  slots: tagAnatomy.keys(),
  base: {
    root: {
      height: "var(--chakra-sizes-6)",
      boxShadow: "none",
    },
    label: {
      fontWeight: "var(--chakra-font-weights-medium)",
      padding: "0 2px",
      userSelect: "text",
    },
  },
  variants: {
    variant: {
      surface: {
        root: {
          boxShadow: "none",
        },
        label: {
          fontSize: "var(--chakra-font-sizes-sm)",
        },
      },
      solid: {
        root: {
          backgroundColor: "colorPalette.500",
        },
      },
    },
  },
});

const checkboxSlotRecipe = defineSlotRecipe({
  slots: checkboxAnatomy.keys(),
  base: {
    root: {
      colorPalette: "blue",
    },
    indicator: {
      _checked: {
        backgroundColor: "blue.500",
      },
    },
    label: {
      fontWeight: "normal",
    },
  },
  variants: {
    variant: {
      solid: {
        control: {
          "&:is([data-state=checked], [data-state=indeterminate])": {
            borderColor: "blue.500",
          },
        },
      },
    },
  },
});

const listSlotRecipe = defineSlotRecipe({
  slots: listAnatomy.keys(),
  base: {
    item: {
      marginLeft: "4",
    },
  },
});

const dialogSlotRecipe = defineSlotRecipe({
  slots: dialogAnatomy.keys(),
  base: {
    header: {
      fontSize: "lg",
      fontWeight: "var(--chakra-font-weights-semibold)",
      alignItems: "center",
    },
  },
});

const baseConfig = defineConfig({
  globalCss: {
    html: {
      fontSize: "16px",
    },
  },
  theme: {
    recipes: {
      button: buttonRecipe,
      input: inputRecipe,
    },
    slotRecipes: {
      switch: switchSlotRecipe,
      editable: editableSlotRecipe,
      popover: popoverSlotRecipe,
      accordion: accordionSlotRecipe,
      field: fieldSlotRecipe,
      tag: tagSlotRecipe,
      checkbox: checkboxSlotRecipe,
      list: listSlotRecipe,
      dialog: dialogSlotRecipe,
    },
  },
});
export const baseSystem = createSystem(defaultConfig, baseConfig);
