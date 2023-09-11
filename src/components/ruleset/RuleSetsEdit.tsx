import { useEffect, useState } from "react";
import { css } from "@emotion/react";
import cloneDeep from "lodash-es/cloneDeep";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Button,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { CSSTransition } from "react-transition-group";
import {
  RULE_ID_EDITING,
  Rule,
  RuleSet,
  RuleSets,
  newRuleSetTemplate,
} from "@/modules/core/rules";
import { push, removeAt, replaceAt } from "@/modules/core/array";
import { EditableTitle } from "@/components/forms/EditableTitle";
import { RulesEdit } from "@/components/ruleset/RulesEdit";
import { SlideTransitionGroup } from "@/components/transition/SlideTransitionGroup";
import { RuleSetMenu } from "./RuleSetMenu";

type Props = {
  ruleSets: RuleSets;
  onChange: (ruleSets: RuleSets) => void;
};

const listTransitionCss = css(`
  display: flex;
  flex-direction: column;
  align-items: normal;
  margin-bottom: 16px;
  gap: 16px;
`);

export const RuleSetsEdit: React.FC<Props> = ({
  ruleSets: originalRuleSets,
  onChange,
}) => {
  const [ruleSets, setRuleSets] = useState<RuleSets>(originalRuleSets);
  const [filteredRuleSets, setFilteredRuleSets] = useState<RuleSets>([]);
  const [accordionOpenStates, setAccordionOpenStates] = useState<number[][]>(
    []
  );

  useEffect(() => {
    setFilteredRuleSets(filterAvailableRuleSets(ruleSets));
  }, [ruleSets]);

  function addRuleSet() {
    setRuleSets(push(ruleSets, cloneDeep(newRuleSetTemplate)));
    // open new accordion
    setAccordionOpenStates(push(accordionOpenStates, [0]));
  }

  function updateRules(rules: Rule[], ruleSetIndex: number) {
    if (rules.length === 0) {
      // add -> cancel
      setRuleSets(removeAt(ruleSets, ruleSetIndex));
    } else {
      const ruleSet = { ...ruleSets[ruleSetIndex], rules } as RuleSet;
      const newRuleSets = replaceAt(ruleSets, ruleSetIndex, ruleSet);
      setRuleSets(newRuleSets);

      // filter editing
      onChange(filterAvailableRuleSets(newRuleSets));
    }
  }

  function removeRuleSet(index: number) {
    const ruleSet = ruleSets[index];
    if (ruleSet.rules.filter((r) => r.id !== RULE_ID_EDITING).length === 0) {
      // new rule set: same as cancel
      setRuleSets(removeAt(ruleSets, index));
    } else {
      setRuleSets(removeAt(ruleSets, index));
      onChange(filterAvailableRuleSets(ruleSets));
    }
  }

  function updateRuleSetTitle(title: string, index: number) {
    const ruleSet = { ...ruleSets[index], name: title } as RuleSet;
    const newRuleSets = replaceAt(ruleSets, index, ruleSet);
    setRuleSets(newRuleSets);
    onChange(newRuleSets);
  }

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
                      onChange={(title) =>
                        updateRuleSetTitle(title, ruleSetIndex)
                      }
                    />
                  </Box>
                  {filteredRuleSets.length > 1 && (
                    <RuleSetMenu onRemove={() => removeRuleSet(ruleSetIndex)} />
                  )}
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel paddingX={6}>
                  <RulesEdit
                    rules={ruleSet.rules}
                    onChange={(rules) => updateRules(rules, ruleSetIndex)}
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

function filterAvailableRuleSets(ruleSets: RuleSets): RuleSets {
  return ruleSets
    .map((ruleSet) => {
      const rules = ruleSet.rules.filter((rule) => rule.id !== RULE_ID_EDITING);
      return { ...ruleSet, rules };
    })
    .filter((ruleSet) => ruleSet.rules.length > 0);
}
