/* v8 ignore file -- @preserve */
import { ReactElement } from "react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { render } from "vitest-browser-react";
import "@/index.scss";

// Mock chrome API for browser tests
if (typeof window !== "undefined" && !window.chrome) {
  // @ts-expect-error - mock chrome for tests
  window.chrome = {};
}

// VRT安定化: アニメーション・トランジションを強制無効化
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.id = "vrt-stability";
  style.textContent = `
    *, *::before, *::after {
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
    }
  `;
  if (!document.getElementById("vrt-stability")) {
    document.head.appendChild(style);
  }
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
