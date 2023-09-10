import { DeleteIcon } from "@chakra-ui/icons";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { CSSProperties, useRef } from "react";

type Props = {
  style?: CSSProperties;
  onClick: () => void;
};

export const RemoveButton: React.FC<Props> = ({ onClick, style }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        leftIcon={<DeleteIcon />}
        onClick={onOpen}
        colorScheme="red"
        style={style}
      >
        Remove
      </Button>
      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>Remove</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>Are you sure you want to remove?</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" ml={3} onClick={onClick}>
              Remove
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
