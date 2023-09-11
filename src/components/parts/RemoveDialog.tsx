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
        <AlertDialogBody>Are you sure you want to remove?</AlertDialogBody>
        <AlertDialogFooter>
          <Button ref={cancelRef} variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="red" ml={3} onClick={onPerform}>
            Remove
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
