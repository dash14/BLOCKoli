import { ChromeApiFactory } from "@/modules/chrome/factory";
import {
  MatchedRule,
  PopupController,
} from "@/modules/clients/PopupController";
import logging from "@/modules/utils/logging";
import { Box, HStack, IconButton, Link, Switch, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ExternalLinkIcon, RepeatIcon, SettingsIcon } from "@chakra-ui/icons";
import { MatchedRulesTable } from "@/features/popup/components/MatchedRulesTable";
import { Header } from "@/features/popup/components/Header";

const log = logging.getLogger("popup");

const chrome = new ChromeApiFactory();
const controller = new PopupController(chrome.declarativeNetRequest());
const optionsUrl = chrome.runtime().getURL("options.html");

function Popup() {
  const [loaded, setLoaded] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [matchedRules, setMatchedRules] = useState<MatchedRule[]>([]);

  useEffect(function () {
    log.debug("initialize");
    controller.initialize(async (state) => {
      setEnabled(state === "enable");
      try {
        await updateMatchedRules();
      } finally {
        setLoaded(true);
      }
    });

    return () => {
      log.debug("destroy");
      controller.destroy();
    };
  }, []);

  async function onChangeSwitch(checked: boolean) {
    if (checked) {
      await controller.enable();
    } else {
      await controller.disable();
    }
  }

  async function updateMatchedRules() {
    setMatchedRules(await controller.getMatchedRulesInActiveTab());
  }

  return (
    <Box width="360px" height="320px" padding="0" position="relative">
      <Header />

      {loaded && (
        <Box as="main" marginX="30px">
          <HStack marginTop="20px" justifyContent="space-between">
            <Text fontSize={18}>Enable blocking rules</Text>
            <Switch
              isChecked={enabled}
              onChange={(e) => onChangeSwitch(e.target.checked)}
            />
          </HStack>

          <Box marginTop="10px">
            <Text fontSize={16}>
              <Link
                href={optionsUrl}
                color="blue.500"
                target="_blank"
                rel="noopener"
                display="inline-flex"
                alignItems="center"
                gap="3px"
              >
                <SettingsIcon />
                Configure rules
                <ExternalLinkIcon />
              </Link>
            </Text>
          </Box>

          {/* Table title */}
          <HStack marginTop="10px" justifyContent="space-between">
            <Text fontSize="14px">
              Matched rules in tabs (within 5 minutes)
            </Text>
            <IconButton
              icon={<RepeatIcon />}
              aria-label="Refresh"
              variant="ghost"
              size="sm"
              color="black"
              onClick={updateMatchedRules}
            />
          </HStack>

          {/* Table */}
          <MatchedRulesTable matchedRules={matchedRules} height="110px" />
        </Box>
      )}
    </Box>
  );
}

export default Popup;
