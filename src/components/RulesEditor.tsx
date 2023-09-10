import { Rule, RuleActionType, RuleWithId } from "@/modules/core/rules";
import { RuleValidator } from "@/modules/core/validation";
import { RuleEditor } from "./RuleEditor";
import { useList } from "@uidotdev/usehooks";
import { RuleBox } from "./RuleBox";
import { Button, VStack } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

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
  rules,
  onChange,
  ruleValidator,
}) => {
  const [isEditingList, listOp] = useList<boolean>(rules.map(() => false));
  const isAllowAdd = rules.filter((r) => r.id === 0).length === 0;

  function updateRule(rule: Rule, index: number) {
    onChange(rules.map((r, i) => (i === index ? rule : r)) as RuleWithId[]);
  }

  return (
    <VStack alignItems="normal" gap={4}>
      {rules.map((rule, ruleIndex) => (
        <RuleEditor
          key={ruleIndex}
          rule={rule ?? newRuleTemplate}
          isEditing={isEditingList[ruleIndex] ?? false}
          onChange={(rule) => updateRule(rule, ruleIndex)}
          onEditingChange={(e) => listOp.updateAt(ruleIndex, e)}
          ruleValidator={ruleValidator}
        />
      ))}
      {isAllowAdd && (
        <RuleBox>
          <Button variant="outline" size="sm" leftIcon={<AddIcon />}>
            Add Rule
          </Button>
        </RuleBox>
      )}
    </VStack>
  );
};
