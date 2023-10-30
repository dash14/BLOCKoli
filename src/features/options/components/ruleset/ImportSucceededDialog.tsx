import { forwardRef, useImperativeHandle, useRef } from "react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { Button, useDisclosure } from "@chakra-ui/react";
import {
  AlertDialog,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
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
        <AlertDialogContent maxWidth="30rem" paddingTop={5}>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            <CheckCircleIcon boxSize={7} marginRight={2} color="green.500" />
            {i18n["import_succeeded"]}
          </AlertDialogHeader>

          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              variant="outline"
              size="sm"
              onClick={onDialogClose}
            >
              {i18n["Close"]}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
});
