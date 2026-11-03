import { createRef } from "react";
import { Button, HStack, Icon } from "@chakra-ui/react";
import { css } from "@emotion/react";
import { LuPlus } from "react-icons/lu";
import { CSSTransition } from "react-transition-group";
import { SlideTransitionGroup } from "@/components/transition/SlideTransitionGroup";
import { useRulesEdit } from "@/features/options/hooks/useRulesEdit";
import { useI18n } from "@/hooks/useI18n";
import { RULE_ID_EDITING, StoredRule } from "@/modules/rules/stored";
import { RuleContainer } from "./RuleContainer";
import { RuleEdit } from "./RuleEdit";
import { RuleLimitReached } from "./RuleLimitReached";

type Props = {
  rules: StoredRule[];
  isAddAllowed: boolean;
  onChange: (rules: StoredRule[]) => void;
};

export const RulesEdit: React.FC<Props> = ({ rules, isAddAllowed, onChange }) => {
  const i18n = useI18n();
  const { isAllowAdd, addRule, updateRule, removeRule, cancelEdit } =
    useRulesEdit(rules, onChange);
  const savedCount = rules.filter((r) => r.id !== RULE_ID_EDITING).length;

  const boxRef = createRef<HTMLDivElement>();

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
        {rules.map((rule, ruleIndex) => {
          const nodeRef = createRef<HTMLDivElement>();
          return (
            <CSSTransition
              key={ruleIndex}
              timeout={250}
              classNames="slide"
              nodeRef={nodeRef}
            >
              <div ref={nodeRef}>
                <RuleEdit
                  rule={rule}
                  isRemoveEnabled={
                    rule.id !== RULE_ID_EDITING && savedCount > 1
                  }
                  onChange={(rule) => updateRule(rule, ruleIndex)}
                  onCancel={() => cancelEdit(ruleIndex)}
                  onRemove={() => removeRule(ruleIndex)}
                />
              </div>
            </CSSTransition>
          );
        })}
      </SlideTransitionGroup>
      <CSSTransition
        in={isAllowAdd}
        timeout={250}
        classNames="fade"
        unmountOnExit
        css={addButtonTransition}
        nodeRef={boxRef}
      >
        <div ref={boxRef}>
          <RuleContainer>
            <HStack gap={3}>
              <Button
                variant="outline"
                size="sm"
                disabled={!isAddAllowed}
                onClick={addRule}
              >
                <Icon as={LuPlus} />
                {i18n["AddARule"]}
              </Button>
              {!isAddAllowed && <RuleLimitReached />}
            </HStack>
          </RuleContainer>
        </div>
      </CSSTransition>
    </>
  );
};
