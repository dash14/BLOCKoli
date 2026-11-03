import { Text } from "@chakra-ui/react";
import { useI18n } from "@/hooks/useI18n";

export const RuleLimitReached: React.FC = () => {
  const i18n = useI18n();
  return (
    <Text fontSize={14} color="fg.muted">
      {i18n["RuleLimitReached"]}
    </Text>
  );
};
