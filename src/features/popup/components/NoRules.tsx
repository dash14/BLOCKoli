import { Box, Text } from "@chakra-ui/react";
import { ConfigureRulesLink } from "./ConfigureRulesLink";

type Props = {
  optionsUrl: string;
};

export const NoRules: React.FC<Props> = ({ optionsUrl }) => {
  return (
    <Box marginTop={4}>
      <Text fontSize={14}>
        No rules are defined.
        <br />
        First, please setup the rules from the following.
      </Text>
      <Box marginTop={8}>
        <ConfigureRulesLink optionsUrl={optionsUrl} />
      </Box>
    </Box>
  );
};
