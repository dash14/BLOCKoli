import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import ReactDOM from "react-dom/client";
import Options from "./pages/Options";
import "./index.css";

const theme = extendTheme({
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
    <Options />
  </ChakraProvider>
);
