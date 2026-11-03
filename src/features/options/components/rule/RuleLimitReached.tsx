import { Text } from "@chakra-ui/react";
import { useI18n } from "@/hooks/useI18n";
import { MAX_RULES } from "@/modules/rules/limits";

export const RuleLimitReached: React.FC = () => {
  const i18n = useI18n();
  return (
    <Text fontSize={14} color="fg.muted">
      {i18n["RuleLimitReached"].replace("{max}", String(MAX_RULES))}
    </Text>
  );
};
