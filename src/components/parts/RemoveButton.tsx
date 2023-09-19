import { DeleteIcon } from "@chakra-ui/icons";
import { Button, ChakraProps, useDisclosure } from "@chakra-ui/react";
import { useI18n } from "@/hooks/useI18n";
import { RemoveDialog } from "./RemoveDialog";

type Props = {
  title?: string;
  onPerform: () => void;
} & ChakraProps;

export const RemoveButton: React.FC<Props> = ({
  title,
  onPerform,
  ...props
}) => {
  const i18n = useI18n();
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        leftIcon={<DeleteIcon />}
        onClick={onOpen}
        colorScheme="red"
        {...props}
      >
        {i18n["Remove"]}
      </Button>
      <RemoveDialog
        title={title}
        isOpen={isOpen}
        onClose={onClose}
        onPerform={onPerform}
      />
    </>
  );
};
