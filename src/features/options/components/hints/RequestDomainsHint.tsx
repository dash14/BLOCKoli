import { Box, HTMLChakraProps, List } from "@chakra-ui/react";
import { HintPopover } from "@/components/parts/HintPopover";
import { useI18n } from "@/hooks/useI18n";

type Props = Omit<HTMLChakraProps<"button">, "css">;

export const RequestDomainsHint: React.FC<Props> = (props) => {
  const i18n = useI18n();
  return (
    <HintPopover title={i18n["RequestDomains"]} contentWidth={450} {...props}>
      {i18n["hint_RequestDomains_1"]}
      <br />
      {i18n["hint_RequestDomains_2"]}
      <Box marginTop={1}>{i18n["hint_Note"]}:</Box>
      <List.Root>
        <List.Item>{i18n["hint_Domains_note_1"]}</List.Item>
        <List.Item>{i18n["hint_Domains_note_2"]}</List.Item>
        <List.Item>{i18n["hint_Domains_note_3"]}</List.Item>
        <List.Item>{i18n["hint_Domains_note_4"]}</List.Item>
      </List.Root>
    </HintPopover>
  );
};
