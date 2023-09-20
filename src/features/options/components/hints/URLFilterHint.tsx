import { Box, ListItem, UnorderedList } from "@chakra-ui/react";
import { ExternalLink } from "@/components/parts/ExternalLink";
import { HintPopover } from "@/components/parts/HintPopover";
import { useI18n } from "@/hooks/useI18n";

export const URLFilterHint: React.FC = () => {
  const i18n = useI18n();
  return (
    <HintPopover title={i18n["URLFilter"]} width={450}>
      {i18n["hint_URLFilter_1"]}
      <br />
      {i18n["hint_URLFilter_2"]}
      <ExternalLink href="https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#filter-matching-charactgers">
        API reference (urlFilter)
      </ExternalLink>
      {i18n["hint_URLFilter_3"]}
      <Box marginTop={1}>{i18n["hint_Note"]}:</Box>
      <UnorderedList marginLeft={5}>
        <ListItem>
          {i18n["hint_URLFilter_note_1_1"]}
          {i18n["hint_URLFilter_note_1_2"]}
        </ListItem>
      </UnorderedList>
    </HintPopover>
  );
};
