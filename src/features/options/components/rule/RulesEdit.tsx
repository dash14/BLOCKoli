import { createRef } from "react";
import { Button, HStack, Icon } from "@chakra-ui/react";
import { css } from "@emotion/react";
import { LuPlus } from "react-icons/lu";
import { CSSTransition } from "react-transition-group";
import { SlideTransitionGroup } from "@/components/transition/SlideTransitionGroup";
import { RuleEntry } from "@/features/options/hooks/useRuleSetsEdit";
import { useI18n } from "@/hooks/useI18n";
import { Rule } from "@/modules/core/rules";
import { RuleContainer } from "./RuleContainer";
import { RuleEdit } from "./RuleEdit";
import { RuleLimitReached } from "./RuleLimitReached";

type Props = {
  rules: RuleEntry[];
  isAddAllowed: boolean;
  onAdd: () => void;
  // Resolves to false when the save was rejected
  onSaveNew: (key: string, rule: Rule) => Promise<boolean>;
  onUpdate: (id: number, rule: Rule) => Promise<boolean>;
  onCancelNew: (key: string) => void;
  onRemove: (id: number) => void;
};

export const RulesEdit: React.FC<Props> = ({
  rules,
  isAddAllowed,
  onAdd,
  onSaveNew,
  onUpdate,
  onCancelNew,
  onRemove,
}) => {
  const i18n = useI18n();
  const savedCount = rules.filter(({ id }) => id !== undefined).length;
  // One rule is added at a time
  const isAdding = savedCount < rules.length;

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
        {rules.map(({ key, rule, id }) => {
          const nodeRef = createRef<HTMLDivElement>();
          return (
            <CSSTransition
              key={key}
              timeout={250}
              classNames="slide"
              nodeRef={nodeRef}
            >
              <div ref={nodeRef}>
                <RuleEdit
                  rule={rule}
                  isRemoveEnabled={id !== undefined && savedCount > 1}
                  onChange={(rule) =>
                    id === undefined ? onSaveNew(key, rule) : onUpdate(id, rule)
                  }
                  onCancel={() => {
                    if (id === undefined) onCancelNew(key);
                  }}
                  // Offered only for saved rules
                  onRemove={() => onRemove(id!)}
                />
              </div>
            </CSSTransition>
          );
        })}
      </SlideTransitionGroup>
      <CSSTransition
        in={!isAdding}
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
                onClick={onAdd}
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
