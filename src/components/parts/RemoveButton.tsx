import { DeleteIcon } from "@chakra-ui/icons";
import { Button, useDisclosure } from "@chakra-ui/react";
import { CSSProperties } from "react";
import { RemoveDialog } from "./RemoveDialog";

type Props = {
  title?: string;
  onPerform: () => void;
  style?: CSSProperties;
};

export const RemoveButton: React.FC<Props> = ({ title, onPerform, style }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
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
      <RemoveDialog
        title={title}
        isOpen={isOpen}
        onClose={onClose}
        onPerform={onPerform}
      />
    </>
  );
};
