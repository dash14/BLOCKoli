/* v8 ignore file -- @preserve */
import { ReactElement } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { render } from "vitest-browser-react";
import { baseSystem } from "@/theme";
import "@/index.scss";

// Mock chrome API for browser tests
if (typeof window !== "undefined" && !window.chrome) {
  // @ts-expect-error - mock chrome for tests
  window.chrome = {};
}

// VRT stabilization: Force disable animations and transitions
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.id = "vrt-stability";
  style.textContent = `
    * {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: geometricPrecision;
    }
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

export function renderWithChakra(ui: ReactElement) {
  return render(<ChakraProvider value={baseSystem}>{ui}</ChakraProvider>);
}
