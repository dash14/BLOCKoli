import { HTMLChakraProps, Icon, Link, Text } from "@chakra-ui/react";
import { LuExternalLink, LuSettings } from "react-icons/lu";
import { useI18n } from "@/hooks/useI18n";

type Props = {
  optionsUrl: string;
} & Omit<HTMLChakraProps<"p">, "css">;

export const ConfigureRulesLink: React.FC<Props> = ({
  optionsUrl,
  ...props
}) => {
  const i18n = useI18n();
  return (
    <Text fontSize={16} {...props}>
      <Link
        href={optionsUrl}
        color="blue.500"
        target="_blank"
        rel="noopener"
        display="inline-flex"
        alignItems="center"
        gap="3px"
      >
        <Icon as={LuSettings} />
        {i18n["ConfigureRules"]}
        <Icon as={LuExternalLink} />
      </Link>
    </Text>
  );
};
