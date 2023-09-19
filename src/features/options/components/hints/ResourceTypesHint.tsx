import { HintPopover } from "@/components/parts/HintPopover";
import { useI18n } from "@/hooks/useI18n";

export const ResourceTypesHint: React.FC = () => {
  const i18n = useI18n();
  return (
    <HintPopover title={i18n["ResourceTypes"]} width={400}>
      {i18n["hint_ResourceTypes_1"]}
    </HintPopover>
  );
};
