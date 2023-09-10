import { Rule, RuleActionType, RuleWithId } from "@/modules/core/rules";
import { RuleValidator } from "@/modules/core/validation";
import { RuleEditor } from "./RuleEditor";
import { useList } from "@uidotdev/usehooks";
import { RuleBox } from "./RuleBox";
import { Button } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import cloneDeep from "lodash-es/cloneDeep";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { css } from "@emotion/react";

type Props = {
  rules: RuleWithId[];
  onChange: (rules: RuleWithId[]) => void;
  ruleValidator: RuleValidator;
};

const newRuleTemplate: RuleWithId = {
  id: 0,
  action: {
    type: RuleActionType.BLOCK,
  },
  condition: {},
};

export const RulesEditor: React.FC<Props> = ({
  rules: originalRules,
  onChange,
  ruleValidator,
}) => {
  const [rules, ruleListOp] = useList<RuleWithId>(originalRules);
  const [isEditingList, editingListOp] = useList<boolean>(
    originalRules.map(() => false)
  );

  function isAllowAdd(rules: RuleWithId[]) {
    return rules.filter((r) => r.id === 0).length === 0;
  }

  function updateRule(rule: Rule, index: number) {
    ruleListOp.updateAt(index, rule as RuleWithId);
    onChange(rules);
  }

  function addRule() {
    ruleListOp.push(cloneDeep(newRuleTemplate));
    editingListOp.push(true);
  }

  function cancelEdit(ruleIndex: number) {
    if (rules[ruleIndex].id === 0) {
      // new rule
      ruleListOp.removeAt(ruleIndex);
      editingListOp.removeAt(ruleIndex);
    }
  }

  const transitionCss = css(`
    display: flex;
    flex-direction: column;
    align-items: normal;
    gap: 16px;

    .item-enter {
      opacity: 0;
      max-height: 0;
    }
    .item-enter-active {
      opacity: 1;
      max-height: 1000px;
      transition: all 250ms ease-in;
    }
    .item-exit {
      opacity: 1;
      max-height: 1000px;
    }
    .item-exit-active {
      opacity: 0;
      max-height: 0;
      transition: all 250ms ease-in;
    }
  `);

  return (
    <TransitionGroup className="rule-list" css={transitionCss}>
      {rules.map((rule, ruleIndex) => (
        <CSSTransition
          key={ruleIndex}
          timeout={250}
          className="item"
          classNames="item"
        >
          <RuleEditor
            key={ruleIndex}
            rule={rule ?? newRuleTemplate}
            isEditing={isEditingList[ruleIndex] ?? false}
            onChange={(rule) => updateRule(rule, ruleIndex)}
            onCancel={() => cancelEdit(ruleIndex)}
            onEditingChange={(e) => editingListOp.updateAt(ruleIndex, e)}
            ruleValidator={ruleValidator}
          />
        </CSSTransition>
      ))}
      {isAllowAdd(rules) && (
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
      )}
    </TransitionGroup>
  );
};
