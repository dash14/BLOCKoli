import { useRef } from "react";
import { Button, Dialog } from "@chakra-ui/react";
import { useI18n } from "@/hooks/useI18n";

type Props = {
  title?: string;
  open: boolean;
  onClose: () => void;
  onPerform: () => void;
};

export const RemoveDialog: React.FC<Props> = ({
  title,
  open,
  onClose,
  onPerform,
}) => {
  const i18n = useI18n();
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => !e.open && onClose()}
      initialFocusEl={() => cancelRef.current}
      role="alertdialog"
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>{title ?? "Remove"}</Dialog.Header>
          <Dialog.CloseTrigger />
          <Dialog.Body fontSize={14}>{i18n["remove_confirmation"]}</Dialog.Body>
          <Dialog.Footer>
            <Button ref={cancelRef} variant="outline" onClick={onClose}>
              {i18n["Cancel"]}
            </Button>
            <Button colorPalette="red" ml={3} onClick={onPerform}>
              {i18n["Remove"]}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
