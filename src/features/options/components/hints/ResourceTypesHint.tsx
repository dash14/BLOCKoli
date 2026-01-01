import { HTMLChakraProps } from "@chakra-ui/react";
import { HintPopover } from "@/components/parts/HintPopover";
import { useI18n } from "@/hooks/useI18n";

type Props = Omit<HTMLChakraProps<"button">, "css">;

export const ResourceTypesHint: React.FC<Props> = (props) => {
  const i18n = useI18n();
  return (
    <HintPopover title={i18n["ResourceTypes"]} contentWidth={400} {...props}>
      {i18n["hint_ResourceTypes_1"]}
    </HintPopover>
  );
};
