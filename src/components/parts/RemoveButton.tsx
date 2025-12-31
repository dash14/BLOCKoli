import { Button, HTMLChakraProps, Icon, useDisclosure } from "@chakra-ui/react";
import { LuTrash2 } from "react-icons/lu";
import { useI18n } from "@/hooks/useI18n";
import { RemoveDialog } from "./RemoveDialog";

type Props = {
  title?: string;
  onPerform: () => void;
} & Omit<HTMLChakraProps<"button">, "css">;

export const RemoveButton: React.FC<Props> = ({
  title,
  onPerform,
  ...props
}) => {
  const i18n = useI18n();
  const { open, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={onOpen}
        colorPalette="red"
        {...props}
      >
        <Icon as={LuTrash2} />
        {i18n["Remove"]}
      </Button>
      <RemoveDialog
        title={title}
        open={open}
        onClose={onClose}
        onPerform={onPerform}
      />
    </>
  );
};
