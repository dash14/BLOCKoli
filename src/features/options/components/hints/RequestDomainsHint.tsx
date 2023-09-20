import { Box, ListItem, UnorderedList } from "@chakra-ui/react";
import { HintPopover } from "@/components/parts/HintPopover";
import { useI18n } from "@/hooks/useI18n";

export const RequestDomainsHint: React.FC = () => {
  const i18n = useI18n();
  return (
    <HintPopover title={i18n["RequestDomains"]} width={450}>
      {i18n["hint_RequestDomains_1"]}
      <br />
      {i18n["hint_RequestDomains_2"]}
      <Box marginTop={1}>{i18n["hint_Note"]}:</Box>
      <UnorderedList marginLeft={5}>
        <ListItem>{i18n["hint_Domains_note_1"]}</ListItem>
        <ListItem>{i18n["hint_Domains_note_2"]}</ListItem>
        <ListItem>{i18n["hint_Domains_note_3"]}</ListItem>
        <ListItem>{i18n["hint_Domains_note_4"]}</ListItem>
      </UnorderedList>
    </HintPopover>
  );
};
