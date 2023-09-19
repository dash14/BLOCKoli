import { Box, ListItem, UnorderedList } from "@chakra-ui/react";
import { HintPopover } from "@/components/parts/HintPopover";
import { useI18n } from "@/hooks/useI18n";

export const InitiatorDomainsHint: React.FC = () => {
  const i18n = useI18n();
  return (
    <HintPopover title={i18n["InitiatorDomains"]} width={400}>
      {i18n["hint_InitiatorDomains_1"]}
      <br />
      {i18n["hint_InitiatorDomains_2"]}
      <Box marginTop={1}>{i18n["hint_Note"]}:</Box>
      <UnorderedList marginLeft={5}>
        <ListItem>{i18n["hint_Domains_note_1"]}</ListItem>
        <ListItem>{i18n["hint_Domains_note_2"]}</ListItem>
        <ListItem>{i18n["hint_Domains_note_3"]}</ListItem>
        <ListItem>{i18n["hint_InitiatorDomains_note_1"]}</ListItem>
        <ListItem>{i18n["hint_Domains_note_4"]}</ListItem>
      </UnorderedList>
    </HintPopover>
  );
};
