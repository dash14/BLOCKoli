import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import ReactDOM from "react-dom/client";
import Popup from "./pages/Popup.tsx";
import "./index.css";

const theme = extendTheme({
  components: {
    Button: {
      defaultProps: {
        colorScheme: "blue",
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <ChakraProvider theme={theme}>
    <Popup />
  </ChakraProvider>
);
