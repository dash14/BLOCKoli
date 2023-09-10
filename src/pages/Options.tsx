import {
  Container,
  Box,
  Switch,
  Heading,
  HStack,
  Text,
} from "@chakra-ui/react";

import { useI18n } from "../hooks/useI18n";
import { RuleSets } from "@/modules/core/rules";
import { useEffect, useState } from "react";
import { ChromeApiFactory } from "@/modules/chrome/factory";
import { UnsupportedRegexReason } from "@/modules/chrome/api";
import {
  OptionController,
  RegexValidator,
} from "@/modules/clients/OptionController";
import { RuleSetsEditor } from "@/components/RuleSetsEditor";

// Regex Validator
const chrome = new ChromeApiFactory();
const regexValidator: RegexValidator = chrome.isExtension()
  ? async (regex: string, isCaseSensitive: boolean) =>
      chrome
        .declarativeNetRequest()
        .isRegexSupported({ regex, isCaseSensitive })
  : async (regex: string, isCaseSensitive: boolean) => {
      try {
        new RegExp(regex, isCaseSensitive ? "i" : "");
        return { isSupported: true };
      } catch (e) {
        return {
          isSupported: false,
          reason: UnsupportedRegexReason.SYNTAX_ERROR,
        };
      }
    };

const controller = new OptionController(regexValidator);

// TODO: タイトルの更新

function Options() {
  const i18n = useI18n();

  const [ruleSets, setRuleSets] = useState<RuleSets>([]);

  useEffect(() => {
    controller.getRuleSets().then(setRuleSets);
  }, []);

  function updateRuleSet(ruleSets: RuleSets) {
    setRuleSets(ruleSets);
  }

  return (
    <>
      <Container maxW="960px">
        <Box borderWidth="1px" borderRadius="lg" marginY="6" padding="8">
          <Heading as="h1" fontSize={28}>
            {i18n["Options"]}
          </Heading>

          <HStack marginY={10}>
            <Text fontSize={18} marginRight={10}>
              Apply Rules
            </Text>
            <Switch />
          </HStack>

          <Heading as="h2" fontSize={18} fontWeight="normal" marginBottom={4}>
            Rule Sets:
          </Heading>

          {ruleSets.length > 0 && (
            <RuleSetsEditor
              ruleSets={ruleSets}
              onChange={updateRuleSet}
              ruleValidator={(e) => controller.validateRule(e)}
            />
          )}
        </Box>
      </Container>
    </>
  );
}

export default Options;
