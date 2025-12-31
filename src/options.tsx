/* v8 ignore file -- @preserve */
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import Options from "./pages/Options";
import { baseSystem } from "./theme";
import "./index.scss";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <ChakraProvider value={baseSystem}>
    <Options />
  </ChakraProvider>
);
