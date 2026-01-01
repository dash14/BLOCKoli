import { Checkbox, Field, HStack, Text } from "@chakra-ui/react";
import { I18nMessageMap } from "@/hooks/useI18n";

type Props = {
  isEditing: boolean;
  isRegexFilter?: boolean | undefined;
  urlFilter?: string | undefined;
  onChange: (value: boolean) => void;
  i18n: I18nMessageMap;
};

export const IsRegexFilter: React.FC<Props> = ({
  isEditing,
  isRegexFilter,
  urlFilter,
  onChange,
  i18n,
}) => {
  return isEditing ? (
    <HStack alignItems="start">
      <Field.Root paddingTop="2px" width="auto">
        <Checkbox.Root
          defaultChecked={isRegexFilter}
          checked={isRegexFilter}
          onCheckedChange={(e) => onChange(!!e.checked)}
          size="sm"
          marginTop="3px"
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label>{i18n["UseRegex"]}</Checkbox.Label>
        </Checkbox.Root>
      </Field.Root>
    </HStack>
  ) : (
    isRegexFilter && urlFilter && (
      <HStack>
        <Text as="span"> ({i18n["UseRegex"]})</Text>
      </HStack>
    )
  );
};
