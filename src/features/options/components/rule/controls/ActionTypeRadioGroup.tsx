import { HStack, Icon, RadioGroup, Stack, Text } from "@chakra-ui/react";
import { LuBan, LuCircleCheckBig } from "react-icons/lu";
import { I18nMessageMap } from "@/hooks/useI18n";
import { RuleActionType } from "@/modules/core/rules";

type Props = {
  isEditing: boolean;
  actionType?: RuleActionType | undefined;
  onChange: (value: RuleActionType) => void;
  i18n: I18nMessageMap;
};

export const ActionTypeRadioGroup: React.FC<Props> = ({
  isEditing,
  actionType,
  onChange,
  i18n,
}) => {
  return isEditing ? (
    <RadioGroup.Root
      value={actionType}
      onValueChange={(e) => onChange(e.value as RuleActionType)}
    >
      <Stack direction="row">
        <RadioGroup.Item value="block" colorPalette="red">
          <RadioGroup.ItemHiddenInput />
          <RadioGroup.ItemIndicator />
          <RadioGroup.ItemText>{i18n["action_block"]}</RadioGroup.ItemText>
        </RadioGroup.Item>
        <RadioGroup.Item value="allow" colorPalette="green">
          <RadioGroup.ItemHiddenInput />
          <RadioGroup.ItemIndicator />
          <RadioGroup.ItemText>{i18n["action_allow"]}</RadioGroup.ItemText>
        </RadioGroup.Item>
      </Stack>
    </RadioGroup.Root>
  ) : (
    <HStack gap={1}>
      {actionType === RuleActionType.BLOCK ? (
        <Icon as={LuBan} color="red" boxSize={4} />
      ) : (
        <Icon as={LuCircleCheckBig} color="green" boxSize={4} />
      )}
      <Text as="span" fontSize={16}>
        {
          i18n[
            actionType === RuleActionType.BLOCK
              ? "action_block"
              : "action_allow"
          ]
        }
      </Text>
    </HStack>
  );
};
