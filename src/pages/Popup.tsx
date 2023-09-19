import { Box } from "@chakra-ui/react";
import { Header } from "@/features/popup/components/Header";
import { Main } from "@/features/popup/components/Main";
import { useRequestBlockClient } from "@/hooks/useRequestBlockClient";
import { ChromeApiFactory } from "@/modules/chrome/factory";

const chrome = new ChromeApiFactory();
const optionsUrl = chrome.runtime().getURL("options.html");

const Popup: React.FC = () => {
  const { loaded, enabled, ruleSets, changeState, getMatchedRule } =
    useRequestBlockClient();

  return (
    <Box width="360px" height="320px" padding="0" position="relative">
      <Header />

      {loaded && (
        <Main
          isServiceEnabled={enabled}
          changeServiceState={changeState}
          ruleSets={ruleSets}
          getMatchedRule={getMatchedRule}
          optionsUrl={optionsUrl}
        />
      )}
    </Box>
  );
};

export default Popup;
