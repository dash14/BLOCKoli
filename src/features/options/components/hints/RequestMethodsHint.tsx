import { Box, HTMLChakraProps, List } from "@chakra-ui/react";
import { HintPopover } from "@/components/parts/HintPopover";
import { useI18n } from "@/hooks/useI18n";

type Props = Omit<HTMLChakraProps<"button">, "css">;

export const RequestMethodsHint: React.FC<Props> = (props) => {
  const i18n = useI18n();
  return (
    <HintPopover title={i18n["RequestMethods"]} contentWidth={350} {...props}>
      {i18n["hint_RequestMethods_1"]}
      <Box marginTop={1}>{i18n["hint_Note"]}:</Box>
      <List.Root>
        <List.Item>{i18n["hint_RequestMethods_note_1"]}</List.Item>
      </List.Root>
    </HintPopover>
  );
};
