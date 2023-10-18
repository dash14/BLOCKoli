import { forwardRef, useImperativeHandle, useRef } from "react";
import { Button, Icon, useDisclosure } from "@chakra-ui/react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { FaFileUpload } from "react-icons/fa";
import { useDefer } from "@/hooks/useDefer";

export type ImportConfirmationDialogHandle = {
  open: () => Promise<boolean>;
};

export const ImportConfirmationDialog = forwardRef((_, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
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
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onDialogCancel}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Import from file
          </AlertDialogHeader>

          <AlertDialogBody>
            エクスポートしたファイルを読み込み、設定に追加します。
            <br />
            もしすでに同じ名前のルールセットが存在する場合は上書きします。
            <br />
            実行してよろしいですか?
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              variant="outline"
              size="sm"
              onClick={onDialogCancel}
            >
              Cancel
            </Button>
            <Button
              leftIcon={<Icon as={FaFileUpload} />}
              size="sm"
              onClick={onImport}
              ml={3}
            >
              Import
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
});
