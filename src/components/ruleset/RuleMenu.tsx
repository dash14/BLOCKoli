import { DeleteIcon, HamburgerIcon } from "@chakra-ui/icons";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";
import { useRef, MouseEvent } from "react";

type Props = {
  onRemove: () => void;
};

export const RuleMenu: React.FC<Props> = ({ onRemove }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  function onClickDeleteMenu(event: MouseEvent) {
    event.stopPropagation();
    onOpen();
  }

  function onClickRemoveInDialog() {
    onClose();
    onRemove();
  }

  return (
    <>
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<HamburgerIcon />}
          aria-label="more"
          variant="ghost"
          colorScheme="gray"
          size="sm"
          onClick={(e) => e.stopPropagation()}
        />
        <MenuList>
          <MenuItem
            icon={<DeleteIcon />}
            color="red"
            onClick={(e) => onClickDeleteMenu(e)}
          >
            Remove Rule
          </MenuItem>
        </MenuList>
      </Menu>

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
            <Button colorScheme="red" ml={3} onClick={onClickRemoveInDialog}>
              Remove
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
