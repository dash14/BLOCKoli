import { forwardRef, useImperativeHandle, useRef } from "react";
import { WarningTwoIcon } from "@chakra-ui/icons";
import { Box, Button, HStack, Icon, useDisclosure } from "@chakra-ui/react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { FaUpload } from "react-icons/fa";
import { useDefer } from "@/hooks/useDefer";
import { I18nMessageMap } from "@/hooks/useI18n";

export type ImportConfirmationDialogHandle = {
  open: () => Promise<boolean>;
};

type Props = {
  i18n: I18nMessageMap;
};

export const ImportConfirmationDialog = forwardRef(({ i18n }: Props, ref) => {
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
        <AlertDialogContent maxWidth="30rem">
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            <Icon as={FaUpload} marginRight={2} />
            {i18n["ImportRules"]}
          </AlertDialogHeader>

          <AlertDialogBody>
            {i18n["import_description3"]}
            <HStack marginY={3}>
              <WarningTwoIcon boxSize={5} color="orange.300" />
              <Box>{i18n["import_description2"]}</Box>
            </HStack>
            {i18n["import_description4"]}
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              variant="outline"
              size="sm"
              onClick={onDialogCancel}
            >
              {i18n["Cancel"]}
            </Button>
            <Button size="sm" onClick={onImport} ml={3}>
              {i18n["Import"]}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
});
