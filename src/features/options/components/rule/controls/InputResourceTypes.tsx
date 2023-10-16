import { Box } from "@chakra-ui/layout";
import { MultipleSelect } from "@/components/forms/MultipleSelect";
import { LabelTags } from "@/components/parts/LabelTags";
import { I18nMessageMap } from "@/hooks/useI18n";
import { RESOURCE_TYPES, ResourceType } from "@/modules/core/rules";

type Props = {
  isEditing: boolean;
  resourceTypes?: ResourceType[] | undefined;
  onChange: (value: ResourceType[]) => void;
  width: number;
  i18n: I18nMessageMap;
};

const resourceTypeOptions = RESOURCE_TYPES.map((method) => ({
  label: method,
  value: method,
}));

export const InputResourceTypes: React.FC<Props> = ({
  isEditing,
  resourceTypes,
  onChange,
  width,
  i18n,
}) => {
  return isEditing ? (
    <Box width={width}>
      <MultipleSelect
        placeholder={i18n["ALL"]}
        options={resourceTypeOptions}
        value={resourceTypes}
        onChange={(v) => onChange(v as ResourceType[])}
      />
    </Box>
  ) : (
    <LabelTags
      empty={i18n["ALL"]}
      options={resourceTypeOptions}
      values={resourceTypes}
      maxWidth={550}
      marginTop="2px"
    />
  );
};
