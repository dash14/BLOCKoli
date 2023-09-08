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
import { RuleEditor } from "@/components/RuleEditor";
import { Rule, RuleActionType } from "@/modules/core/rules";
import { useState } from "react";

const ruleTemplate: Rule = {
  action: {
    type: RuleActionType.BLOCK,
  },
  condition: {},
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
        <Box
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          marginY="6"
          padding="8"
        >
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
