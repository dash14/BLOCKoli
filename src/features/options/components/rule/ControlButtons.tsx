import { Button, Group, HTMLChakraProps, Icon } from "@chakra-ui/react";
import { LuPencil, LuX } from "react-icons/lu";
import { RemoveButton } from "@/components/parts/RemoveButton";
import { useI18n } from "@/hooks/useI18n";

type Props = {
  save: () => void;
  cancel: () => void;
  remove: () => void;
  isValid: boolean;
  isRemoveEnabled: boolean;
} & Omit<HTMLChakraProps<"div">, "css">;

export const ControlButtons: React.FC<Props> = ({
  save,
  cancel,
  remove,
  isValid,
  isRemoveEnabled,
  ...props
}) => {
  const i18n = useI18n();
  return (
    <Group width="100%" {...props}>
      <Button onClick={save} disabled={!isValid}>
        <Icon as={LuPencil} size="xs" />
        {i18n["Save"]}
      </Button>
      <Button variant="outline" onClick={cancel}>
        <Icon as={LuX} size="xs" />
        {i18n["Cancel"]}
      </Button>
      {isRemoveEnabled && (
        <RemoveButton
          title={i18n["remove_rule_confirmation_title"]}
          onPerform={remove}
          marginLeft="auto"
        />
      )}
    </Group>
  );
};
