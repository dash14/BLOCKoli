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
import { FaUpload } from "react-icons/fa";
import { I18nMessageMap } from "@/hooks/useI18n";

export type ImportSucceededDialogHandle = {
  open: () => Promise<void>;
};

type Props = {
  i18n: I18nMessageMap;
};

export const ImportSucceededDialog = forwardRef(({ i18n }: Props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
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
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onDialogClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent maxWidth="30rem">
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            <Icon as={FaUpload} marginRight={2} />
            {i18n["ImportRules"]}
          </AlertDialogHeader>

          <AlertDialogBody>Import succeeded.</AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} size="sm" onClick={onDialogClose}>
              Close
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
});
