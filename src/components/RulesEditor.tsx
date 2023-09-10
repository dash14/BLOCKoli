import {
  RULE_ID_EDITING,
  RULE_ID_UNSAVED,
  Rule,
  RuleWithId,
  newRuleTemplate,
} from "@/modules/core/rules";
import { RuleValidator } from "@/modules/core/validation";
import { RuleEditor } from "./RuleEditor";
import { RuleBox } from "./RuleBox";
import { Button } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import cloneDeep from "lodash-es/cloneDeep";
import { CSSTransition } from "react-transition-group";
import { css } from "@emotion/react";
import { SlideTransitionGroup } from "./transition/SlideTransitionGroup";
import { useEffect, useState } from "react";
import { push, removeAt, replaceAt } from "@/modules/core/array";

type Props = {
  rules: RuleWithId[];
  onChange: (rules: RuleWithId[]) => void;
  ruleValidator: RuleValidator;
};

export const RulesEditor: React.FC<Props> = ({
  rules: originalRules,
  onChange,
  ruleValidator,
}) => {
  const [rules, setRules] = useState<RuleWithId[]>(originalRules);
  const [isEditingList, setIsEditingList] = useState<boolean[]>(
    originalRules.map(() => false)
  );
  const [isAllowAdd, setIsAllowAdd] = useState(true);

  useEffect(() => {
    if (rules.length === 1 && rules[0].id === RULE_ID_EDITING) {
      setIsEditingList([true]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIsAllowAdd(rules.filter((r) => r.id === RULE_ID_EDITING).length === 0);
  }, [rules]);

  function updateRule(rule: Rule, index: number) {
    const updated = rule as RuleWithId;
    if (updated.id === RULE_ID_EDITING) {
      updated.id = RULE_ID_UNSAVED;
    }
    const newRules = replaceAt(rules, index, updated);
    setRules(newRules);
    onChange(newRules);
  }

  function updateEditing(isEditing: boolean, index: number) {
    const newList = replaceAt(isEditingList, index, isEditing);
    setIsEditingList(newList);
  }

  function addRule() {
    setRules(push(rules, cloneDeep(newRuleTemplate)));
    setIsEditingList(push(isEditingList, true));
  }

  function cancelEdit(ruleIndex: number) {
    if (rules[ruleIndex].id === RULE_ID_EDITING) {
      // cancel new rule
      const newRules = removeAt(rules, ruleIndex);
      setRules(newRules);
      setIsEditingList(removeAt(isEditingList, ruleIndex));
      if (newRules.length === 0) {
        onChange(newRules); // Notify that it is empty.
      }
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
            <RuleEditor
              rule={rule ?? newRuleTemplate}
              isEditing={isEditingList[ruleIndex] ?? false}
              onChange={(rule) => updateRule(rule, ruleIndex)}
              onCancel={() => cancelEdit(ruleIndex)}
              onEditingChange={(e) => updateEditing(e, ruleIndex)}
              ruleValidator={ruleValidator}
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
        <RuleBox>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<AddIcon />}
            onClick={addRule}
          >
            Add Rule
          </Button>
        </RuleBox>
      </CSSTransition>
    </>
  );
};
