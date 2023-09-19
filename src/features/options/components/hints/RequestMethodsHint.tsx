import { Box, ListItem, UnorderedList } from "@chakra-ui/react";
import { HintPopover } from "@/components/parts/HintPopover";
import { useI18n } from "@/hooks/useI18n";

export const RequestMethodsHint: React.FC = () => {
  const i18n = useI18n();
  return (
    <HintPopover title={i18n["RequestMethods"]} width={400}>
      {i18n["hint_RequestMethods_1"]}
      <Box marginTop={1}>{i18n["hint_Note"]}:</Box>
      <UnorderedList marginLeft={5}>
        <ListItem>{i18n["hint_RequestMethods_note_1"]}</ListItem>
      </UnorderedList>
    </HintPopover>
  );
};
