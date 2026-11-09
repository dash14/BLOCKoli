import { Text } from "@chakra-ui/react";
import { formatMessage, useI18n } from "@/hooks/useI18n";
import { MAX_RULES } from "@/modules/rules/limits";

export const RuleLimitReached: React.FC = () => {
  const i18n = useI18n();
  return (
    <Text fontSize={14} color="fg.muted">
      {formatMessage(i18n["RuleLimitReached"], { max: MAX_RULES })}
    </Text>
  );
};
