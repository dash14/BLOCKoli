import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import ReactDOM from "react-dom/client";
import Options from "./pages/Options";
import "./index.css";

const styles = {
  global: {
    html: {
      fontSize: "14px",
    },
    ".chakra-react-select__menu-portal": {
      zIndex: "100",
      marginTop: "-30px",
    },
    ".chakra-collapse": {
      overflow: "visible !important",
    },
  },
};

const theme = extendTheme({
  styles,
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
    Input: {
      defaultProps: {
        size: "sm",
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <ChakraProvider theme={theme}>
    <Options />
  </ChakraProvider>
);
