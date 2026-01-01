import { useImperativeHandle, useRef } from "react";
import { Button, Dialog, Icon, useDisclosure } from "@chakra-ui/react";
import { LuCircleCheckBig } from "react-icons/lu";
import { I18nMessageMap } from "@/hooks/useI18n";

export type ImportSucceededDialogHandle = {
  open: () => Promise<void>;
};

type Props = {
  i18n: I18nMessageMap;
  ref?: React.Ref<ImportSucceededDialogHandle>;
};

export const ImportSucceededDialog: React.FC<Props> = ({ i18n, ref }) => {
  const { open, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useImperativeHandle(ref, () => ({
    async open(): Promise<void> {
      onOpen();
    },
  }));

  function onDialogClose() {
    onClose();
  }

  return (
    <Dialog.Root
      open={open}
      placement="center"
      onOpenChange={(e) => !e.open && onDialogClose()}
      initialFocusEl={() => cancelRef.current}
      role="alertdialog"
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxWidth="30rem" paddingTop={5}>
          <Dialog.Header fontSize="lg" fontWeight="bold">
            <Icon
              as={LuCircleCheckBig}
              boxSize={7}
              marginRight={2}
              color="green.500"
            />
            {i18n["import_succeeded"]}
          </Dialog.Header>

          <Dialog.Footer>
            <Button
              ref={cancelRef}
              variant="outline"
              size="sm"
              onClick={onDialogClose}
            >
              {i18n["Close"]}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
