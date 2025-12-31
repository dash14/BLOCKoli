import { Box, HTMLChakraProps, List } from "@chakra-ui/react";
import { ExternalLink } from "@/components/parts/ExternalLink";
import { HintPopover } from "@/components/parts/HintPopover";
import { useI18n } from "@/hooks/useI18n";

type Props = Omit<HTMLChakraProps<"button">, "css">;

export const URLFilterHint: React.FC<Props> = (props) => {
  const i18n = useI18n();
  return (
    <HintPopover title={i18n["URLFilter"]} contentWidth={450} {...props}>
      {i18n["hint_URLFilter_1"]}
      <br />
      {i18n["hint_URLFilter_2"]}
      <ExternalLink href="https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#filter-matching-charactgers">
        API reference (urlFilter)
      </ExternalLink>
      {i18n["hint_URLFilter_3"]}
      <Box marginTop={1}>{i18n["hint_Note"]}:</Box>
      <List.Root marginLeft={5}>
        <List.Item>
          {i18n["hint_URLFilter_note_1_1"]}
          {i18n["hint_URLFilter_note_1_2"]}
        </List.Item>
      </List.Root>
    </HintPopover>
  );
};
