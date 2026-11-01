import { Box, Text } from "@chakra-ui/react";
import { Header } from "@/features/popup/components/Header";
import { Main } from "@/features/popup/components/Main";
import { useI18n } from "@/hooks/useI18n";
import { useRequestBlockClient } from "@/hooks/useRequestBlockClient";
import { useTitleFontAdjuster } from "@/hooks/useTitleFontAdjuster";
import { ChromeApiFactory } from "@/modules/chrome/factory";

const chrome = new ChromeApiFactory();
const optionsUrl = chrome.runtime().getURL("options.html");

const Popup: React.FC = () => {
  const i18n = useI18n();
  const {
    loaded,
    loadFailed,
    enabled,
    ruleSets,
    changeState,
    getMatchedRule,
    language,
  } = useRequestBlockClient();
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

      {loadFailed && (
        <Text role="alert" marginX="30px" marginTop={4} fontSize={14}>
          {i18n["load_failed"]}
        </Text>
      )}
    </Box>
  );
};

export default Popup;
