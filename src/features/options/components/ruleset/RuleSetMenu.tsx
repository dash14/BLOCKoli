import { MouseEvent } from "react";
import { DeleteIcon, HamburgerIcon } from "@chakra-ui/icons";
import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";
import { RemoveDialog } from "../../../../components/parts/RemoveDialog";

type Props = {
  onRemove: () => void;
};

export const RuleSetMenu: React.FC<Props> = ({ onRemove }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

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
          onClick={(e) => e.stopPropagation()}
        />
        <MenuList>
          <MenuItem
            icon={<DeleteIcon />}
            color="red"
            onClick={(e) => onClickDeleteMenu(e)}
          >
            Remove this Rule Set
          </MenuItem>
        </MenuList>
      </Menu>

      <RemoveDialog
        title="Remove the Rule Set"
        isOpen={isOpen}
        onClose={onClose}
        onPerform={onClickRemoveInDialog}
      />
    </>
  );
};
