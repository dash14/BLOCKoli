import {
  Editable,
  Flex,
  Group,
  HTMLChakraProps,
  IconButton,
  Input,
} from "@chakra-ui/react";
import { LuCheck, LuPencil, LuX } from "react-icons/lu";

const KEYCODE_IME_PROCESS = 229; // Enter key during input with IME

type Props = {
  defaultValue?: string;
  onChange: (text: string) => void;
} & Omit<HTMLChakraProps<"div">, "css" | "onChange">;

export const EditableTitle: React.FC<Props> = ({
  defaultValue = "RuleSet",
  fontSize = "large",
  onChange,
  ...props
}) => {
  return (
    <Editable.Root
      defaultValue={defaultValue}
      fontSize={fontSize}
      onValueCommit={(e) => onChange(e.value)}
      {...props}
    >
      <Flex direction="row" alignItems="center" position="relative" flex={1}>
        <Editable.Preview marginX={4} marginY={1} cursor={props.cursor} />
        <Editable.Input
          as={Input}
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
        <Editable.Control>
          <Editable.Context>
            {(editable) =>
              editable.editing ? (
                <Group
                  justifyContent="center"
                  gap="0"
                  position="absolute"
                  right={2}
                  onClick={(e) => e.stopPropagation()}
                  css={{ zIndex: 2 }}
                >
                  <Editable.SubmitTrigger asChild>
                    <IconButton aria-label="Apply" variant="ghost" size="xs">
                      <LuCheck />
                    </IconButton>
                  </Editable.SubmitTrigger>
                  <Editable.CancelTrigger asChild>
                    <IconButton
                      aria-label="Cancel"
                      variant="ghost"
                      size="xs"
                      marginLeft={0}
                    >
                      <LuX />
                    </IconButton>
                  </Editable.CancelTrigger>
                </Group>
              ) : (
                <Flex
                  justifyContent="center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Editable.EditTrigger asChild>
                    <IconButton aria-label="Edit" variant="ghost" size="sm">
                      <LuPencil color="gray" />
                    </IconButton>
                  </Editable.EditTrigger>
                </Flex>
              )
            }
          </Editable.Context>
        </Editable.Control>
      </Flex>
    </Editable.Root>
  );
};
