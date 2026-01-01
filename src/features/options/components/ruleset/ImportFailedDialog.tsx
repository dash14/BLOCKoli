import { useImperativeHandle, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  HStack,
  Icon,
  List,
  useDisclosure,
} from "@chakra-ui/react";
import { LuAlertTriangle } from "react-icons/lu";
import {
  I18nMessageMap,
  getLocalizedValidationErrorText,
} from "@/hooks/useI18n";
import { RuleSetsValidationError } from "@/modules/rules/validation/RuleSets";

export type ImportFailedDialogHandle = {
  open: (errors: RuleSetsValidationError[]) => Promise<void>;
};

type Props = {
  i18n: I18nMessageMap;
  ref?: React.Ref<ImportFailedDialogHandle>;
};

export const ImportFailedDialog: React.FC<Props> = ({ i18n, ref }) => {
  const { open, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [errors, setErrors] = useState<RuleSetsValidationError[]>([]);

  useImperativeHandle(ref, () => ({
    async open(errors: RuleSetsValidationError[]): Promise<void> {
      setErrors(errors);
      onOpen();
    },
  }));

  function onDialogClose() {
    onClose();
  }

  function getAdditionalErrorText(error: RuleSetsValidationError): string {
    const texts: string[] = [];
    if (Number.isInteger(error.ruleSetNumber)) {
      texts.push(`ruleSets[${error.ruleSetNumber}]`);

      if (error.ruleSetField) {
        texts.push(`.${error.ruleSetField}`);

        if (Number.isInteger(error.ruleNumber)) {
          texts.push(`[${error.ruleNumber}]`);

          if (error.ruleField) {
            texts.push(`.${error.ruleField}`);
          }
        }
      }
    }

    if (texts.length > 0) {
      return " (" + texts.join("") + ")";
    } else {
      return "";
    }
  }

  return (
    <Dialog.Root
      open={open}
      placement="center"
      onOpenChange={(e) => !e.open && onDialogClose()}
      initialFocusEl={() => cancelRef.current}
      role="alertdialog"
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxWidth="30rem" paddingTop={2}>
          <Dialog.Header fontSize="lg" fontWeight="bold">
            <Icon
              as={LuAlertTriangle}
              boxSize={7}
              color="red.500"
              marginRight={2}
            />
            {i18n["import_failed"]}
          </Dialog.Header>

          <Dialog.Body>
            <List.Root marginLeft={6}>
              {errors
                .filter((error) => error.message)
                .map((error, i) => (
                  <List.Item key={i} flexDirection="column" marginY={1}>
                    <HStack flexWrap="wrap" gap={0}>
                      <Box marginRight={2}>
                        {getLocalizedValidationErrorText(error.message!, i18n)}
                      </Box>
                      <Box>{getAdditionalErrorText(error)}</Box>
                    </HStack>
                  </List.Item>
                ))}
            </List.Root>
          </Dialog.Body>

          <Dialog.Footer>
            <Button
              ref={cancelRef}
              variant="outline"
              size="sm"
              onClick={onDialogClose}
            >
              {i18n["Close"]}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
