import { Box, Text } from "@chakra-ui/react";
import { useI18n } from "@/hooks/useI18n";
import { ConfigureRulesLink } from "./ConfigureRulesLink";

type Props = {
  optionsUrl: string;
};

export const NoRules: React.FC<Props> = ({ optionsUrl }) => {
  const i18n = useI18n();
  return (
    <Box marginTop={4}>
      <Text fontSize={14}>
        {i18n["initial_setup_message_1"]}
        <br />
        {i18n["initial_setup_message_2"]}
      </Text>
      <Box marginTop={8}>
        <ConfigureRulesLink optionsUrl={optionsUrl} />
      </Box>
    </Box>
  );
};
