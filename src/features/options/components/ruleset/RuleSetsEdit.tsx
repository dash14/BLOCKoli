import { useEffect, useState } from "react";
import { AddIcon } from "@chakra-ui/icons";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Button,
  Text,
} from "@chakra-ui/react";
import { css } from "@emotion/react";
import { CSSTransition } from "react-transition-group";
import { EditableTitle } from "@/components/forms/EditableTitle";
import { SlideTransitionGroup } from "@/components/transition/SlideTransitionGroup";
import { RulesEdit } from "@/features/options/components/rule/RulesEdit";
import { push } from "@/modules/core/array";
import { RuleSets } from "@/modules/core/rules";
import { useRuleSetsEdit } from "../../hooks/useRuleSetsEdit";
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
  const [accordionOpenStates, setAccordionOpenStates] = useState<number[][]>(
    []
  );

  const {
    ruleSets,
    addRuleSet: addRuleSetInHook,
    updateRules,
    removeRuleSet,
    updateRuleSetTitle,
  } = useRuleSetsEdit(originalRuleSets, onChange);

  useEffect(() => {
    if (ruleSets.length === 0) {
      if (originalRuleSets.length === 1) {
        setAccordionOpenStates([[0]]);
      } else {
        setAccordionOpenStates(originalRuleSets.map(() => []));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalRuleSets]);

  function addRuleSet() {
    addRuleSetInHook();
    // open new accordion
    setAccordionOpenStates(push(accordionOpenStates, [0]));
  }

  return (
    <>
      {ruleSets.length === 0 && (
        <Text fontSize={16} marginLeft={10}>
          (empty)
        </Text>
      )}
      <SlideTransitionGroup style={listTransitionCss}>
        {ruleSets.map((ruleSet, ruleSetIndex) => (
          <CSSTransition key={ruleSetIndex} timeout={250} classNames="slide">
            <Accordion
              defaultIndex={accordionOpenStates[ruleSetIndex]}
              allowMultiple
            >
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
                  <RuleSetMenu onRemove={() => removeRuleSet(ruleSetIndex)} />
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
          Add a Rule Set
        </Button>
      </Box>
    </>
  );
};
