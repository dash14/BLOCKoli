import {
  Container,
  Box,
  Switch,
  Heading,
  HStack,
  Text,
  Button,
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
  RuleSet,
  RuleSets,
  newRuleSetTemplate,
} from "@/modules/core/rules";
import { useEffect, useState } from "react";
import { ChromeApiFactory } from "@/modules/chrome/factory";
import { UnsupportedRegexReason } from "@/modules/chrome/api";
import {
  OptionController,
  RegexValidator,
} from "@/modules/clients/OptionController";
import { RulesEditor } from "@/components/RulesEditor";
import { AddIcon } from "@chakra-ui/icons";
import cloneDeep from "lodash-es/cloneDeep";
import { CSSTransition } from "react-transition-group";
import { css } from "@emotion/react";
import { SlideTransitionGroup } from "@/components/transition/SlideTransitionGroup";

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
  const [accordionOpenStates, setAccordionOpenStates] = useState<number[][]>(
    []
  );

  useEffect(() => {
    controller.getRuleSets().then((ruleSets) => {
      setRuleSets(ruleSets);
      // // Open an accordion if there is only one rule set.
      // if (ruleSets.length === 1) {
      //   setAccordionOpenStates([[0]]);
      // } else {
      //   // close all.
      //   setAccordionOpenStates(ruleSets.map(() => []));
      // }
    });
  }, []);

  const updateRules = (rules: Rule[], ruleSetIndex: number) => {
    if (rules.length === 0) {
      // add -> cancel
      setRuleSets(ruleSets.filter((_, i) => i !== ruleSetIndex));
    } else {
      setRuleSets(
        ruleSets.map((ruleSet, i) => {
          if (i === ruleSetIndex) {
            return { ...ruleSet, rules } as RuleSet;
          } else {
            return ruleSet;
          }
        })
      );
    }
  };

  function addRuleSet() {
    setRuleSets([...ruleSets, cloneDeep(newRuleSetTemplate)]);
    // open new accordion
    setAccordionOpenStates([...accordionOpenStates, [0]]);
  }

  const listTransitionCss = css(`
    display: flex;
    flex-direction: column;
    align-items: normal;
    margin-bottom: 16px;
    gap: 16px;
  `);

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

          <SlideTransitionGroup style={listTransitionCss}>
            {ruleSets.map((ruleSet, ruleSetIndex) => (
              <CSSTransition
                key={ruleSetIndex}
                timeout={250}
                classNames="slide"
              >
                <Accordion defaultIndex={[0]} allowMultiple>
                  <AccordionItem key={ruleSetIndex} borderWidth="1px">
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
                </Accordion>
              </CSSTransition>
            ))}
          </SlideTransitionGroup>
          <Box marginTop={4}>
            <Button
              leftIcon={<AddIcon />}
              variant="outline"
              size="sm"
              onClick={addRuleSet}
            >
              Add Rule Set
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}

export default Options;
