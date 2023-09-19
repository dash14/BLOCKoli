import { Box, ListItem, UnorderedList } from "@chakra-ui/react";
import { ExternalLink } from "@/components/parts/ExternalLink";
import { HintPopover } from "@/components/parts/HintPopover";
import { useI18n } from "@/hooks/useI18n";

export const RegexHint: React.FC = () => {
  const i18n = useI18n();
  return (
    <HintPopover title={i18n["hint_UseRegex_title"]} width={500}>
      {i18n["hint_UseRegex_1"]}{" "}
      <ExternalLink href="https://github.com/google/re2/wiki/Syntax">
        RE2 syntax
      </ExternalLink>
      {i18n["hint_UseRegex_2"]}
      <Box marginTop={1}>{i18n["hint_Note"]}:</Box>
      <UnorderedList marginLeft={5}>
        <ListItem>{i18n["hint_UseRegex_note_1"]}</ListItem>
        <ListItem>{i18n["hint_UseRegex_note_2"]}</ListItem>
        <ListItem>
          {i18n["hint_UseRegex_note_3"]}
          <Box
            backgroundColor="#f3f3f3"
            borderRadius="4px"
            border="1px solid #ddd"
            padding="6px 10px"
          >
            {i18n["hint_UseRegex_note_3_message"]}
          </Box>
        </ListItem>
      </UnorderedList>
    </HintPopover>
  );
};
