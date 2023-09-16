import { ExternalLinkIcon, SettingsIcon } from "@chakra-ui/icons";
import { Link, Text } from "@chakra-ui/react";

type Props = {
  optionsUrl: string;
};

export const ConfigureRulesLink: React.FC<Props> = ({ optionsUrl }) => {
  return (
    <Text fontSize={16}>
      <Link
        href={optionsUrl}
        color="blue.500"
        target="_blank"
        rel="noopener"
        display="inline-flex"
        alignItems="center"
        gap="3px"
      >
        <SettingsIcon />
        Configure rules
        <ExternalLinkIcon />
      </Link>
    </Text>
  );
};
