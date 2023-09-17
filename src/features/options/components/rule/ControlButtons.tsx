import { EditIcon, SmallCloseIcon } from "@chakra-ui/icons";
import { Button, ButtonGroup } from "@chakra-ui/react";
import { RemoveButton } from "@/components/parts/RemoveButton";

type Props = {
  save: () => void;
  cancel: () => void;
  remove: () => void;
  isValid: boolean;
  isRemoveEnabled: boolean;
};

export const ControlButtons: React.FC<Props> = ({
  save,
  cancel,
  remove,
  isValid,
  isRemoveEnabled,
}) => {
  return (
    <ButtonGroup size="sm" width="100%">
      <Button leftIcon={<EditIcon />} onClick={save} isDisabled={!isValid}>
        Save
      </Button>
      <Button variant="outline" leftIcon={<SmallCloseIcon />} onClick={cancel}>
        Cancel
      </Button>
      {isRemoveEnabled && (
        <RemoveButton
          title="Remove the rule"
          onPerform={remove}
          marginLeft="auto"
        />
      )}
    </ButtonGroup>
  );
};
