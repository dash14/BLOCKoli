import { useEffect, useState } from "react";
import { AddIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import { css } from "@emotion/react";
import cloneDeep from "lodash-es/cloneDeep";
import { CSSTransition } from "react-transition-group";
import { SlideTransitionGroup } from "@/components/transition/SlideTransitionGroup";
import { push, removeAt, replaceAt } from "@/modules/core/array";
import {
  RULE_ID_EDITING,
  RULE_ID_UNSAVED,
  Rule,
  RuleWithId,
  newRuleTemplate,
} from "@/modules/core/rules";
import { RuleContainer } from "./RuleContainer";
import { RuleEdit } from "./RuleEdit";

type Props = {
  rules: RuleWithId[];
  onChange: (rules: RuleWithId[]) => void;
};

export const RulesEdit: React.FC<Props> = ({ rules, onChange }) => {
  const [isAllowAdd, setIsAllowAdd] = useState(true);

  useEffect(() => {
    setIsAllowAdd(rules.filter((r) => r.id === RULE_ID_EDITING).length === 0);
  }, [rules]);

  function updateRule(rule: Rule, index: number) {
    const updated = rule as RuleWithId;
    if (updated.id === RULE_ID_EDITING) {
      updated.id = RULE_ID_UNSAVED;
    }
    const newRules = replaceAt(rules, index, updated);
    onChange(newRules);
  }

  function removeRule(index: number) {
    const rule = rules[index];
    if (rule.id === RULE_ID_EDITING) {
      cancelEdit(index);
    } else {
      const newRules = removeAt(rules, index);
      onChange(newRules);
    }
  }

  function addRule() {
    onChange(push(rules, cloneDeep(newRuleTemplate)));
  }

  function cancelEdit(index: number) {
    if (rules[index].id === RULE_ID_EDITING) {
      // cancel new rule
      const newRules = removeAt(rules, index);
      onChange(newRules);
    }
  }

  const listTransitionCss = css(`
    display: flex;
    flex-direction: column;
    align-items: normal;
    margin-bottom: 16px;
    gap: 16px;
  `);

  const addButtonTransition = css(`
    &.fade-enter {
      opacity: 0;
    }
    &.fade-enter-active {
      opacity: 1;
      transition: all 250ms linear;
    }
    &.fade-exit {
      opacity: 1;
    }
    &.fade-exit-active {
      opacity: 0;
      transition: all 250ms linear;
    }
  `);

  return (
    <>
      <SlideTransitionGroup style={listTransitionCss}>
        {rules.map((rule, ruleIndex) => (
          <CSSTransition key={ruleIndex} timeout={250} classNames="slide">
            <RuleEdit
              rule={rule ?? newRuleTemplate}
              isRemoveEnabled={
                rule.id !== RULE_ID_EDITING &&
                rules.filter((r) => r.id !== RULE_ID_EDITING).length > 1
              }
              onChange={(rule) => updateRule(rule, ruleIndex)}
              onCancel={() => cancelEdit(ruleIndex)}
              onRemove={() => removeRule(ruleIndex)}
            />
          </CSSTransition>
        ))}
      </SlideTransitionGroup>
      <CSSTransition
        in={isAllowAdd}
        timeout={250}
        classNames="fade"
        unmountOnExit
        css={addButtonTransition}
      >
        <RuleContainer>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<AddIcon />}
            onClick={addRule}
          >
            Add a Rule
          </Button>
        </RuleContainer>
      </CSSTransition>
    </>
  );
};
