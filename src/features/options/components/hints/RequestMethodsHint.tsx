import { Box, ChakraProps, ListItem, UnorderedList } from "@chakra-ui/react";
import { HintPopover } from "@/components/parts/HintPopover";
import { useI18n } from "@/hooks/useI18n";

type Props = ChakraProps;

export const RequestMethodsHint: React.FC<Props> = (props) => {
  const i18n = useI18n();
  return (
    <HintPopover title={i18n["RequestMethods"]} contentWidth={350} {...props}>
      {i18n["hint_RequestMethods_1"]}
      <Box marginTop={1}>{i18n["hint_Note"]}:</Box>
      <UnorderedList marginLeft={5}>
        <ListItem>{i18n["hint_RequestMethods_note_1"]}</ListItem>
      </UnorderedList>
    </HintPopover>
  );
};
