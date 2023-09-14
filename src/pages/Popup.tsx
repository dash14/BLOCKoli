import { ChromeApiFactory } from "@/modules/chrome/factory";
import {
  MatchedRule,
  PopupController,
} from "@/modules/clients/PopupController";
import logging from "@/modules/utils/logging";
import {
  Box,
  HStack,
  Heading,
  IconButton,
  Img,
  Link,
  Switch,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ExternalLinkIcon, RepeatIcon, SettingsIcon } from "@chakra-ui/icons";

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
          <Box
            height="110px"
            overflowY="auto"
            border="1px solid #ccc"
            borderRadius="6px"
          >
            <TableContainer overflowX="unset" overflowY="unset">
              <Table variant="simple" size="sm">
                <Thead
                  position="sticky"
                  top="0"
                  zIndex="docked"
                  backgroundColor="#eee"
                >
                  <Tr>
                    <Th textTransform="none">timestamp</Th>
                    <Th textTransform="none">rule</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {matchedRules.map((rule, i) => (
                    <Tr key={i}>
                      <Td fontSize="12px" paddingY="4px">
                        {rule.timeStamp.toLocaleTimeString()}
                      </Td>
                      <Td
                        fontSize="12px"
                        paddingY="4px"
                        overflowX="hidden"
                        textOverflow="ellipsis"
                        title={
                          rule.rule
                            ? `${rule.rule.ruleSetName} #${rule.rule.number}`
                            : "unknown"
                        }
                      >
                        {rule.rule
                          ? `${rule.rule.ruleSetName} #${rule.rule.number}`
                          : "unknown"}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Popup;
