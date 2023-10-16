import { CheckCircleIcon, NotAllowedIcon } from "@chakra-ui/icons";
import { HStack, Stack, Text } from "@chakra-ui/layout";
import { Radio, RadioGroup } from "@chakra-ui/radio";
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
    <RadioGroup value={actionType} onChange={onChange}>
      <Stack direction="row">
        <Radio value="block" colorScheme="red">
          {i18n["action_block"]}
        </Radio>
        <Radio value="allow" colorScheme="green">
          {i18n["action_allow"]}
        </Radio>
      </Stack>
    </RadioGroup>
  ) : (
    <HStack gap={1}>
      {actionType === RuleActionType.BLOCK ? (
        <NotAllowedIcon color="red" boxSize={4} />
      ) : (
        <CheckCircleIcon color="green" boxSize={4} />
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
