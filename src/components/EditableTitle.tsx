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
import { MouseEventHandler } from "react";

type Props = {
  defaultValue?: string;
} & ChakraProps;

export const EditableTitle: React.FC<Props> = ({
  defaultValue = "RuleSet",
  fontSize = "large",
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

  function EditableControls() {
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
          icon={<EditIcon color="gray.400" />}
          aria-label="Edit"
          variant="ghost"
          size="xs"
          {...getEditButtonProps()}
        />
      </Flex>
    );
  }

  return (
    <Editable
      defaultValue={defaultValue}
      isPreviewFocusable={false}
      fontSize={fontSize}
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
        />
        <EditableControls />
      </Flex>
    </Editable>
  );
};
