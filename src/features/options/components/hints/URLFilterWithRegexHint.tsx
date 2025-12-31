import { Box, HTMLChakraProps, List } from "@chakra-ui/react";
import { ExternalLink } from "@/components/parts/ExternalLink";
import { HintPopover } from "@/components/parts/HintPopover";
import { useI18n } from "@/hooks/useI18n";

type Props = Omit<HTMLChakraProps<"button">, "css">;

export const URLFilterWithRegexHint: React.FC<Props> = (props) => {
  const i18n = useI18n();
  return (
    <HintPopover
      title={i18n["hint_URLFilterWithRegex_title"]}
      contentWidth={500}
      {...props}
    >
      {i18n["hint_URLFilterWithRegex_1"]}{" "}
      <ExternalLink href="https://github.com/google/re2/wiki/Syntax">
        RE2 syntax
      </ExternalLink>
      {i18n["hint_URLFilterWithRegex_2"]}
      <Box marginTop={1}>{i18n["hint_Note"]}:</Box>
      <List.Root marginLeft={5}>
        <List.Item>
          {i18n["hint_URLFilterWithRegex_note_1_1"]}
          {i18n["hint_URLFilterWithRegex_note_1_2"]}
        </List.Item>
        <List.Item>{i18n["hint_URLFilterWithRegex_note_2"]}</List.Item>
        <List.Item>
          {i18n["hint_URLFilterWithRegex_note_3"]}
          <Box
            backgroundColor="#f3f3f3"
            borderRadius="4px"
            border="1px solid #ddd"
            padding="6px 10px"
          >
            rules_1.json: Rule with id 1 specified a more complext regex than
            allowed as part of the "regexFilter" key.
          </Box>
        </List.Item>
      </List.Root>
    </HintPopover>
  );
};
