/* v8 ignore file -- @preserve: only mounts the tested Popup page */
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import Popup from "./pages/Popup.tsx";
import { baseSystem } from "./theme";
import "./index.scss";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <ChakraProvider value={baseSystem}>
    <Popup />
  </ChakraProvider>
);
