import { Rule, RuleWithId, newRuleTemplate } from "@/modules/core/rules";
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
    if (rules.length === 1 && rules[0].id === 0) {
      setIsEditingList([true]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIsAllowAdd(rules.filter((r) => r.id === 0).length === 0);
  }, [rules]);

  function updateRule(rule: Rule, index: number) {
    const newRules = rules.map((r, i) =>
      i === index ? (rule as RuleWithId) : r
    );
    setRules(newRules);
    onChange(newRules);
  }

  function updateEditing(isEditing: boolean, index: number) {
    const newIsEditingList = isEditingList.map((e, i) =>
      i === index ? isEditing : e
    );
    setIsEditingList(newIsEditingList);
  }

  function addRule() {
    const newRules = [...rules, cloneDeep(newRuleTemplate)];
    setRules(newRules);
    setIsEditingList([...isEditingList, true]);
  }

  function cancelEdit(ruleIndex: number) {
    if (rules[ruleIndex].id === 0) {
      // new rule
      const newRules = rules.filter((_, i) => i !== ruleIndex);
      setRules(newRules);
      setIsEditingList(isEditingList.filter((_, i) => i !== ruleIndex));
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
