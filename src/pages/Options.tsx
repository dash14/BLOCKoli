import { Container, Box, Grid, GridItem, Switch } from "@chakra-ui/react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import cloneDeep from "lodash-es/cloneDeep";
import { useI18n } from "../hooks/useI18n";
import { EditableTitle } from "@/components/EditableTitle";
import { RegexValidator, RuleEditor } from "@/components/RuleEditor";
import { Rule, RuleActionType } from "@/modules/core/rules";
import { useState } from "react";
import { ChromeApiFactory } from "@/modules/chrome/factory";
import { UnsupportedRegexReason } from "@/modules/chrome/api";

const ruleTemplate: Rule = {
  action: {
    type: RuleActionType.BLOCK,
  },
  condition: {},
};

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

function Options() {
  const i18n = useI18n();

  const [rules, setRules] = useState([cloneDeep(ruleTemplate)]);

  const updateRule = (rule: Rule, index: number) => {
    setRules(rules.map((r, i) => (i === index ? rule : r)));
  };

  return (
    <>
      <Container maxW="960px">
        <Box borderWidth="1px" borderRadius="lg" marginY="6" padding="8">
          <h1>{i18n["Options"]}</h1>

          <Grid templateColumns="repeat(2, 1fr)" width="fit-content" gap={20}>
            <GridItem>Apply Rules</GridItem>
            <GridItem>
              <Switch />
            </GridItem>
          </Grid>

          <h2>Rule Sets</h2>
          <Accordion defaultIndex={[0]} allowMultiple>
            <AccordionItem>
              <h3>
                <AccordionButton as="div" cursor="pointer">
                  <Box flex="1">
                    <EditableTitle cursor="pointer" />
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h3>
              <AccordionPanel pb={4}>
                <RuleEditor
                  rule={rules[0]}
                  onChange={(rule) => updateRule(rule, 0)}
                  regexValidator={regexValidator}
                />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Box>
      </Container>
    </>
  );
}

export default Options;
