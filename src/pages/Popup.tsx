import { useEffect, useState } from "react";
import { Box } from "@chakra-ui/react";
import { Header } from "@/features/popup/components/Header";
import { Main } from "@/features/popup/components/Main";
import { useRequestBlockClient } from "@/hooks/useRequestBlockClient";
import { useTitleFontAdjuster } from "@/hooks/useTitleFontAdjuster";
import { ChromeApiFactory } from "@/modules/chrome/factory";

const chrome = new ChromeApiFactory();
const optionsUrl = chrome.runtime().getURL("options.html");

const Popup: React.FC = () => {
  const { loaded, enabled, ruleSets, changeState, getMatchedRule, language } =
    useRequestBlockClient();
  const { titleFontAdjuster } = useTitleFontAdjuster(language);

  return (
    <Box
      className={language}
      width="360px"
      height="320px"
      padding="0"
      position="relative"
    >
      <Header />

      {loaded && (
        <Main
          isServiceEnabled={enabled}
          changeServiceState={changeState}
          ruleSets={ruleSets}
          getMatchedRule={getMatchedRule}
          optionsUrl={optionsUrl}
          titleFontAdjuster={titleFontAdjuster}
        />
      )}
    </Box>
  );
};

export default Popup;
