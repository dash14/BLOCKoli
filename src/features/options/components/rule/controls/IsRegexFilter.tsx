import { Checkbox } from "@chakra-ui/checkbox";
import { FormControl } from "@chakra-ui/form-control";
import { HStack, Text } from "@chakra-ui/layout";
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
      <FormControl paddingTop="2px" width="auto">
        <Checkbox
          defaultChecked={isRegexFilter}
          checked={isRegexFilter}
          onChange={(e) => onChange(e.target.checked)}
          size="sm"
          marginTop="3px"
        >
          {i18n["UseRegex"]}
        </Checkbox>
      </FormControl>
    </HStack>
  ) : (
    isRegexFilter && urlFilter && (
      <HStack>
        <Text as="span"> ({i18n["UseRegex"]})</Text>
      </HStack>
    )
  );
};
