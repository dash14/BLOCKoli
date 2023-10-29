import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { WarningTwoIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  HStack,
  Icon,
  ListItem,
  UnorderedList,
  useDisclosure,
} from "@chakra-ui/react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { FaUpload } from "react-icons/fa";
import { I18nMessageMap, getLocalizedErrorText } from "@/hooks/useI18n";
import { RuleSetsValidationError } from "@/modules/rules/validation/RuleSets";

export type ImportFailedDialogHandle = {
  open: (errors: RuleSetsValidationError[]) => Promise<void>;
};

type Props = {
  i18n: I18nMessageMap;
};

export const ImportFailedDialog = forwardRef(({ i18n }: Props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
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
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onDialogClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent maxWidth="30rem">
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            <Icon as={FaUpload} marginRight={2} />
            {i18n["ImportRules"]}
          </AlertDialogHeader>

          <AlertDialogBody>
            <HStack>
              <WarningTwoIcon boxSize={5} color="red.500" />
              <Box marginY={3}>Import has been aborted.</Box>
            </HStack>
            <UnorderedList marginLeft={6}>
              {errors
                .filter((error) => error.message)
                .map((error) => (
                  <ListItem flexDirection="column" marginY={1}>
                    <HStack flexWrap="wrap" gap={0}>
                      <Box marginRight={2}>
                        {getLocalizedErrorText(error.message!, i18n)}
                      </Box>
                      <Box>{getAdditionalErrorText(error)}</Box>
                    </HStack>
                  </ListItem>
                ))}
            </UnorderedList>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} size="sm" onClick={onDialogClose}>
              Close
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
});
