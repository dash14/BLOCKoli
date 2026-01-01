import { useImperativeHandle, useRef } from "react";
import {
  Box,
  Button,
  Dialog,
  HStack,
  Icon,
  useDisclosure,
} from "@chakra-ui/react";
import { FaUpload } from "react-icons/fa";
import { LuTriangleAlert } from "react-icons/lu";
import { useDefer } from "@/hooks/useDefer";
import { I18nMessageMap } from "@/hooks/useI18n";

export type ImportConfirmationDialogHandle = {
  open: () => Promise<boolean>;
};

type Props = {
  i18n: I18nMessageMap;
  ref?: React.Ref<ImportConfirmationDialogHandle>;
};

export const ImportConfirmationDialog: React.FC<Props> = ({ i18n, ref }) => {
  const { open, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const defer = useDefer<boolean>();

  useImperativeHandle(ref, () => ({
    async open(): Promise<boolean> {
      onOpen();
      return defer.promise();
    },
  }));

  function onDialogCancel() {
    onClose();
    defer.resolve(false);
  }

  function onImport() {
    onClose();
    defer.resolve(true);
  }

  return (
    <Dialog.Root
      open={open}
      placement="center"
      onOpenChange={(e) => !e.open && onDialogCancel()}
      initialFocusEl={() => cancelRef.current}
      role="alertdialog"
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxWidth="30rem">
          <Dialog.Header fontSize="lg" fontWeight="bold">
            <Icon as={FaUpload} marginRight={2} />
            {i18n["ImportRules"]}
          </Dialog.Header>

          <Dialog.Body>
            {i18n["import_description3"]}
            <HStack marginY={3} alignItems="start">
              <Icon as={LuTriangleAlert} boxSize={5} color="orange.300" />
              <Box>{i18n["import_description2"]}</Box>
            </HStack>
            {i18n["import_description4"]}
          </Dialog.Body>

          <Dialog.Footer>
            <Button
              ref={cancelRef}
              variant="outline"
              size="sm"
              onClick={onDialogCancel}
            >
              {i18n["Cancel"]}
            </Button>
            <Button size="sm" onClick={onImport}>
              {i18n["Import"]}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
