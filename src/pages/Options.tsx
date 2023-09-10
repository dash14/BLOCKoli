import {
  Container,
  Box,
  Switch,
  Heading,
  HStack,
  Text,
} from "@chakra-ui/react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { useI18n } from "../hooks/useI18n";
import { EditableTitle } from "@/components/EditableTitle";
import {
  Rule,
  RuleActionType,
  RuleSet,
  RuleSets,
  RuleWithId,
} from "@/modules/core/rules";
import { useEffect, useState } from "react";
import { ChromeApiFactory } from "@/modules/chrome/factory";
import { UnsupportedRegexReason } from "@/modules/chrome/api";
import {
  OptionController,
  RegexValidator,
} from "@/modules/clients/OptionController";
import { RulesEditor } from "@/components/RulesEditor";

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

const newRuleTemplate: RuleWithId = {
  id: 0,
  action: {
    type: RuleActionType.BLOCK,
  },
  condition: {},
};

function Options() {
  const i18n = useI18n();

  const [ruleSets, setRuleSets] = useState<RuleSets>([]);

  useEffect(() => {
    controller.getRuleSets().then((ruleSets) => {
      setRuleSets(ruleSets);
    });
  }, []);

  const updateRules = (rules: Rule[], ruleSetIndex: number) => {
    setRuleSets(
      ruleSets.map((ruleSet, i) => {
        if (i === ruleSetIndex) {
          return { ...ruleSet, rules } as RuleSet;
        } else {
          return ruleSet;
        }
      })
    );
  };

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
          <Accordion defaultIndex={[0]} allowMultiple>
            {ruleSets.map((ruleSet, ruleSetIndex) => (
              <AccordionItem key={ruleSetIndex}>
                <AccordionButton as="div" cursor="pointer" paddingLeft={2}>
                  <Box flex="1">
                    <EditableTitle
                      defaultValue={ruleSet.name}
                      cursor="pointer"
                    />
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel paddingX={6}>
                  <RulesEditor
                    rules={ruleSet.rules}
                    onChange={(rules) => updateRules(rules, ruleSetIndex)}
                    ruleValidator={(r) => controller.validateRule(r)}
                  />
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Box>
      </Container>
    </>
  );
}

export default Options;
