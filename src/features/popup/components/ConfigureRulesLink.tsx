import { ExternalLinkIcon, SettingsIcon } from "@chakra-ui/icons";
import { Link, Text } from "@chakra-ui/react";
import { useI18n } from "@/hooks/useI18n";

type Props = {
  optionsUrl: string;
};

export const ConfigureRulesLink: React.FC<Props> = ({ optionsUrl }) => {
  const i18n = useI18n();
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
        {i18n["ConfigureRules"]}
        <ExternalLinkIcon />
      </Link>
    </Text>
  );
};
