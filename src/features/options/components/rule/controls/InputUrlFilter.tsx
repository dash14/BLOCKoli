import { Box, Input, Tag } from "@chakra-ui/react";
import { DisableTag } from "@/components/parts/DisableTag";
import { I18nMessageMap } from "@/hooks/useI18n";

type Props = {
  isEditing: boolean;
  urlFilter?: string | undefined;
  isRegexFilter?: boolean | undefined;
  onChange: (value: string) => void;
  width: number;
  maxWidth: number;
  i18n: I18nMessageMap;
};

export const InputUrlFilter: React.FC<Props> = ({
  isEditing,
  urlFilter,
  isRegexFilter,
  onChange,
  width,
  maxWidth,
  i18n,
}) => {
  return isEditing ? (
    <Input
      value={urlFilter ?? ""}
      onChange={(e) => onChange(e.target.value)}
      width={width}
      variant="outline"
      placeholder={
        isRegexFilter
          ? "^https?://www\\.example\\.com/api/"
          : "||www.example.com*^123"
      }
    />
  ) : (
    <Box marginTop="2px">
      {urlFilter ? (
        <Tag.Root maxWidth={maxWidth}>
          <Tag.Label>{urlFilter}</Tag.Label>
        </Tag.Root>
      ) : (
        <DisableTag>{i18n["NotSpecified"]}</DisableTag>
      )}
    </Box>
  );
};
