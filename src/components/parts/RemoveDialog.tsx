import { useRef } from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import { useI18n } from "@/hooks/useI18n";

type Props = {
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  onPerform: () => void;
};

export const RemoveDialog: React.FC<Props> = ({
  title,
  isOpen,
  onClose,
  onPerform,
}) => {
  const i18n = useI18n();
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <AlertDialog
      motionPreset="slideInBottom"
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isOpen={isOpen}
      isCentered
    >
      <AlertDialogOverlay />

      <AlertDialogContent>
        <AlertDialogHeader>{title ?? "Remove"}</AlertDialogHeader>
        <AlertDialogCloseButton />
        <AlertDialogBody fontSize={14}>
          {i18n["remove_confirmation"]}
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button ref={cancelRef} variant="outline" onClick={onClose}>
            {i18n["Cancel"]}
          </Button>
          <Button colorScheme="red" ml={3} onClick={onPerform}>
            {i18n["Remove"]}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
