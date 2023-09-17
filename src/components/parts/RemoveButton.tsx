import { CSSProperties } from "react";
import { DeleteIcon } from "@chakra-ui/icons";
import { Button, ChakraProps, useDisclosure } from "@chakra-ui/react";
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
        Remove
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
