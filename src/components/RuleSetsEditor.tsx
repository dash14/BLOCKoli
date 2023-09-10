import { Box, Button } from "@chakra-ui/react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { EditableTitle } from "@/components/EditableTitle";
import {
  RULE_ID_EDITING,
  Rule,
  RuleSet,
  RuleSets,
  newRuleSetTemplate,
} from "@/modules/core/rules";
import { useState } from "react";
import { RulesEditor } from "@/components/RulesEditor";
import { CSSTransition } from "react-transition-group";
import { css } from "@emotion/react";
import { SlideTransitionGroup } from "@/components/transition/SlideTransitionGroup";
import { push, removeAt, replaceAt } from "@/modules/core/array";
import { RuleValidator } from "@/modules/core/validation";
import { AddIcon } from "@chakra-ui/icons";
import cloneDeep from "lodash-es/cloneDeep";

type Props = {
  ruleSets: RuleSets;
  onChange: (ruleSets: RuleSets) => void;
  ruleValidator: RuleValidator;
};

const listTransitionCss = css(`
  display: flex;
  flex-direction: column;
  align-items: normal;
  margin-bottom: 16px;
  gap: 16px;
`);

export const RuleSetsEditor: React.FC<Props> = ({
  ruleSets: originalRuleSets,
  onChange,
  ruleValidator,
}) => {
  const [accordionOpenStates, setAccordionOpenStates] = useState<number[][]>(
    []
  );
  const [ruleSets, setRuleSets] = useState<RuleSets>(originalRuleSets);

  function addRuleSet() {
    setRuleSets(push(ruleSets, cloneDeep(newRuleSetTemplate)));
    // open new accordion
    setAccordionOpenStates(push(accordionOpenStates, [0]));
  }

  const updateRules = (rules: Rule[], ruleSetIndex: number) => {
    if (rules.length === 0) {
      // add -> cancel
      setRuleSets(removeAt(ruleSets, ruleSetIndex));
    } else {
      const ruleSet = { ...ruleSets[ruleSetIndex], rules } as RuleSet;
      const newRuleSets = replaceAt(ruleSets, ruleSetIndex, ruleSet);
      setRuleSets(newRuleSets);

      // filter editing
      const filtered = newRuleSets
        .map((ruleSet) => {
          const rules = ruleSet.rules.filter(
            (rule) => rule.id !== RULE_ID_EDITING
          );
          return { ...ruleSet, rules };
        })
        .filter((ruleSet) => ruleSet.rules.length > 0);
      onChange(filtered);
    }
  };

  return (
    <>
      <SlideTransitionGroup style={listTransitionCss}>
        {ruleSets.map((ruleSet, ruleSetIndex) => (
          <CSSTransition key={ruleSetIndex} timeout={250} classNames="slide">
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
                    ruleValidator={ruleValidator}
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
    </>
  );
};
