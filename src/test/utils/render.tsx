import { ReactElement } from "react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { render } from "vitest-browser-react";
import "@/index.scss";

// Mock chrome API for browser tests
if (typeof window !== "undefined" && !window.chrome) {
  // @ts-expect-error - mock chrome for tests
  window.chrome = {};
}

// FIXME: Integrate these styles with popups' and options' styles
const theme = extendTheme({
  styles: {
    global: {
      html: { fontSize: "16px" },
    },
  },
  components: {
    Button: { defaultProps: { colorScheme: "blue" } },
    Switch: { defaultProps: { colorScheme: "blue", size: "lg" } },
  },
});

export function renderWithChakra(ui: ReactElement) {
  return render(<ChakraProvider theme={theme}>{ui}</ChakraProvider>);
}
