import { AddIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import { css } from "@emotion/react";
import { CSSTransition } from "react-transition-group";
import { SlideTransitionGroup } from "@/components/transition/SlideTransitionGroup";
import { useRulesEdit } from "@/features/options/hooks/useRulesEdit";
import { useI18n } from "@/hooks/useI18n";
import { RULE_ID_EDITING, StoredRule } from "@/modules/rules/stored";
import { newRuleTemplate } from "@/modules/rules/template";
import { RuleContainer } from "./RuleContainer";
import { RuleEdit } from "./RuleEdit";

type Props = {
  rules: StoredRule[];
  onChange: (rules: StoredRule[]) => void;
};

export const RulesEdit: React.FC<Props> = ({ rules, onChange }) => {
  const i18n = useI18n();
  const { isAllowAdd, addRule, updateRule, removeRule, cancelEdit } =
    useRulesEdit(rules, onChange);

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
            leftIcon={<AddIcon />}
            variant="outline"
            size="sm"
            onClick={addRule}
          >
            {i18n["AddARule"]}
          </Button>
        </RuleContainer>
      </CSSTransition>
    </>
  );
};
