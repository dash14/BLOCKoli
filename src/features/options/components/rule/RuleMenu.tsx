import { MouseEvent } from "react";
import { Icon, IconButton, Menu, useDisclosure } from "@chakra-ui/react";
import { LuMenu, LuTrash2 } from "react-icons/lu";
import { RemoveDialog } from "@/components/parts/RemoveDialog";
import { useI18n } from "@/hooks/useI18n";

type Props = {
  onRemove: () => void;
};

export const RuleMenu: React.FC<Props> = ({ onRemove }) => {
  const i18n = useI18n();
  const { open, onOpen, onClose } = useDisclosure();

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
      <Menu.Root>
        <Menu.Trigger asChild>
          <IconButton
            aria-label="more"
            variant="ghost"
            colorPalette="gray"
            size="sm"
            onClick={(e) => e.stopPropagation()}
          >
            <LuMenu />
          </IconButton>
        </Menu.Trigger>
        <Menu.Positioner>
          <Menu.Content fontSize="1rem">
            <Menu.Item
              value="remove"
              color="red"
              onClick={(e) => onClickDeleteMenu(e)}
            >
              <Icon as={LuTrash2} />
              {i18n["Remove"]}
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Menu.Root>

      <RemoveDialog
        title={i18n["remove_rule_confirmation_title"]}
        open={open}
        onClose={onClose}
        onPerform={onClickRemoveInDialog}
      />
    </>
  );
};
