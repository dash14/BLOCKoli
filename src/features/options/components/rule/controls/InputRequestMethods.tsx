import { Box } from "@chakra-ui/layout";
import { MultipleSelect } from "@/components/forms/MultipleSelect";
import { LabelTags } from "@/components/parts/LabelTags";
import { I18nMessageMap } from "@/hooks/useI18n";
import { REQUEST_METHODS, RequestMethod } from "@/modules/core/rules";

type Props = {
  isEditing: boolean;
  requestMethods?: RequestMethod[] | undefined;
  onChange: (value: RequestMethod[]) => void;
  width: number;
  i18n: I18nMessageMap;
};

const requestMethodOptions = REQUEST_METHODS.map((method) => ({
  label: method.toUpperCase(),
  value: method,
}));

export const InputRequestMethods: React.FC<Props> = ({
  isEditing,
  requestMethods,
  onChange,
  width,
  i18n,
}) => {
  return isEditing ? (
    <Box width={width}>
      <MultipleSelect
        placeholder={i18n["ALL"]}
        options={requestMethodOptions}
        value={requestMethods}
        onChange={(v) => onChange(v as RequestMethod[])}
      />
    </Box>
  ) : (
    <LabelTags
      empty={i18n["ALL"]}
      options={requestMethodOptions}
      values={requestMethods}
      maxWidth={550}
      marginTop="2px"
    />
  );
};
