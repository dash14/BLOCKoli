import { MatchedRuleInfo } from "@/modules/chrome/api";
import { ChromeApiFactory } from "@/modules/chrome/factory";
import { PopupController } from "@/modules/clients/PopupController";
import logging from "@/modules/utils/logging";
import {
  Box,
  Button,
  HStack,
  Heading,
  Img,
  Link,
  Switch,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ExternalLinkIcon, SettingsIcon } from "@chakra-ui/icons";

const log = logging.getLogger("popup");

const chrome = new ChromeApiFactory();
const controller = new PopupController(chrome.declarativeNetRequest());
const optionsUrl = chrome.runtime().getURL("options.html");

function Popup() {
  const [enabled, setEnabled] = useState(false);
  const [rules, setRules] = useState<MatchedRuleInfo[]>([]);

  useEffect(function () {
    log.debug("initialize");
    controller.initialize((state) => setEnabled(state === "enable"));
    updateMatchedRules();

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
    setRules(await controller.getMatchedRulesInActiveTab());
  }

  return (
    <Box width="360px" height="300px" padding="0">
      <HStack
        as="header"
        backgroundColor="#F6FFE7"
        padding="10px 24px"
        justifyContent="space-between"
        borderBottom="1px solid #ddd;"
      >
        <Heading as="h1" fontSize="22px">
          BLOCKoli
        </Heading>
        <Img
          src="images/icon32.png"
          srcSet="images/icon32.png 1x, images/icon32@2x.png 2x"
          width="32px"
          height="32px"
          marginLeft="4px"
        />
      </HStack>

      <Box as="main" marginX="30px">
        <HStack marginTop="20px" justifyContent="space-between">
          <Text fontSize={18}>Enable blocking rules</Text>
          <Switch
            isChecked={enabled}
            onChange={(e) => onChangeSwitch(e.target.checked)}
          />
        </HStack>
        <Box marginTop="10px">
          <Text fontSize={18}>
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
      </Box>
      <Button onClick={updateMatchedRules}>Get matched rules</Button>
      {JSON.stringify(rules)}
    </Box>
  );
}

export default Popup;
