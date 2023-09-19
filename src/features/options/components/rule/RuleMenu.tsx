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
import { RemoveDialog } from "@/components/parts/RemoveDialog";
import { useI18n } from "@/hooks/useI18n";

type Props = {
  onRemove: () => void;
};

export const RuleMenu: React.FC<Props> = ({ onRemove }) => {
  const i18n = useI18n();
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
          size="sm"
          onClick={(e) => e.stopPropagation()}
        />
        <MenuList fontSize="1rem">
          <MenuItem
            icon={<DeleteIcon />}
            color="red"
            onClick={(e) => onClickDeleteMenu(e)}
          >
            {i18n["Remove"]}
          </MenuItem>
        </MenuList>
      </Menu>

      <RemoveDialog
        title={i18n["remove_rule_confirmation_title"]}
        isOpen={isOpen}
        onClose={onClose}
        onPerform={onClickRemoveInDialog}
      />
    </>
  );
};
