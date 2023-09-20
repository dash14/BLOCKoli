import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import Popup from "./pages/Popup.tsx";
import "./index.scss";

const theme = extendTheme({
  styles: {
    global: {
      html: {
        fontSize: "16px",
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: "blue",
      },
    },
    Switch: {
      defaultProps: {
        colorScheme: "blue",
        size: "lg",
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <ChakraProvider theme={theme}>
    <Popup />
  </ChakraProvider>
);
