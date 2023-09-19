import { EditIcon, SmallCloseIcon } from "@chakra-ui/icons";
import { Button, ButtonGroup, ChakraProps } from "@chakra-ui/react";
import { RemoveButton } from "@/components/parts/RemoveButton";
import { useI18n } from "@/hooks/useI18n";

type Props = {
  save: () => void;
  cancel: () => void;
  remove: () => void;
  isValid: boolean;
  isRemoveEnabled: boolean;
} & ChakraProps;

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
    <ButtonGroup size="sm" width="100%" {...props}>
      <Button leftIcon={<EditIcon />} onClick={save} isDisabled={!isValid}>
        {i18n["Save"]}
      </Button>
      <Button variant="outline" leftIcon={<SmallCloseIcon />} onClick={cancel}>
        {i18n["Cancel"]}
      </Button>
      {isRemoveEnabled && (
        <RemoveButton
          title={i18n["remove_rule_confirmation_title"]}
          onPerform={remove}
          marginLeft="auto"
        />
      )}
    </ButtonGroup>
  );
};
