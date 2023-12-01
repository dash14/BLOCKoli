import { MouseEventHandler } from "react";
import { CheckIcon, CloseIcon, EditIcon } from "@chakra-ui/icons";
import {
  ButtonGroup,
  ChakraProps,
  Flex,
  IconButton,
  Input,
  useEditableControls,
} from "@chakra-ui/react";
import { Editable, EditableInput, EditablePreview } from "@chakra-ui/react";

const KEYCODE_IME_PROCESS = 229; // Enter key during input with IME

type Props = {
  defaultValue?: string;
  onChange: (text: string) => void;
} & ChakraProps;

export const EditableTitle: React.FC<Props> = ({
  defaultValue = "RuleSet",
  fontSize = "large",
  onChange,
  ...props
}) => {
  function Preview() {
    const { getEditButtonProps } = useEditableControls();

    const onDoubleClick: MouseEventHandler<HTMLDivElement> = (e) => {
      getEditButtonProps().onClick?.(e);
      e.stopPropagation();
    };

    return (
      <EditablePreview
        marginX={4}
        marginY={1}
        cursor={props.cursor}
        onDoubleClick={onDoubleClick}
      />
    );
  }

  const EditableControls: React.FC = () => {
    const {
      isEditing,
      getSubmitButtonProps,
      getCancelButtonProps,
      getEditButtonProps,
    } = useEditableControls();

    return isEditing ? (
      <ButtonGroup
        variant="ghost"
        size="xs"
        justifyContent="center"
        gap="0"
        position="absolute"
        right={2}
        onClick={(e) => e.stopPropagation()}
        css={{ zIndex: 2 }}
      >
        <IconButton
          icon={<CheckIcon />}
          aria-label="Apply"
          {...getSubmitButtonProps()}
        />
        <IconButton
          icon={<CloseIcon />}
          aria-label="Cancel"
          marginLeft={0}
          {...getCancelButtonProps()}
        />
      </ButtonGroup>
    ) : (
      <Flex justifyContent="center" onClick={(e) => e.stopPropagation()}>
        <IconButton
          icon={<EditIcon color="gray.500" />}
          aria-label="Edit"
          variant="ghost"
          size="sm"
          {...getEditButtonProps()}
        />
      </Flex>
    );
  };

  return (
    <Editable
      defaultValue={defaultValue}
      isPreviewFocusable={false}
      fontSize={fontSize}
      onSubmit={(e) => onChange(e)}
      {...props}
    >
      <Flex direction="row" alignItems="center" position="relative" flex={1}>
        <Preview />
        <Input
          as={EditableInput}
          zIndex={1}
          fontSize={fontSize}
          paddingRight={20}
          onClick={(e) => e.stopPropagation()}
          onKeyUp={(e) => e.stopPropagation()}
          onKeyDown={(e) =>
            // Ignore Enter key input during conversion in IME
            e.keyCode === KEYCODE_IME_PROCESS && e.preventDefault()
          }
        />
        <EditableControls />
      </Flex>
    </Editable>
  );
};
