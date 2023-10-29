import React, { useRef } from "react";
import { Box, Button, Heading, Icon, useDisclosure } from "@chakra-ui/react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
} from "@chakra-ui/react";
import { FaDownload, FaFileDownload, FaUpload } from "react-icons/fa";
import { HiMiniArrowsUpDown } from "react-icons/hi2";
import { FileInput } from "@/components/forms/FileInput";
import { I18nMessageMap } from "@/hooks/useI18n";
import {
  ImportConfirmationDialog,
  ImportConfirmationDialogHandle,
} from "./ImportConfirmationDialog";

type Props = {
  onExport: () => void;
  onImport: (file: File) => void;
  i18n: I18nMessageMap;
};

export const ExportImportDialog: React.FC<Props> = ({
  onExport,
  onImport,
  i18n,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const openConfirmationDialogRef = useRef<ImportConfirmationDialogHandle>();

  async function onSelectImportFile(file: File, input: HTMLInputElement) {
    const dialogRef = openConfirmationDialogRef.current;
    if (!dialogRef) return;

    const result = await dialogRef.open();
    if (result) {
      // import
      onImport(file);
      onClose();
      input.value = "";
    } else {
      // cancel
      input.value = "";
    }
  }

  return (
    <>
      <Button
        leftIcon={<Icon as={HiMiniArrowsUpDown} w={5} h={5} />}
        variant="outline"
        size="sm"
        onClick={onOpen}
      >
        {i18n["ImportAndExportRules"]}
      </Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent maxWidth="36rem">
            <AlertDialogCloseButton />

            <AlertDialogBody paddingTop={10} paddingX={10}>
              <Heading as="h2" fontSize={16}>
                <Icon as={FaUpload} /> {i18n["ImportRules"]}
              </Heading>
              <Box margin={2} marginLeft={6}>
                <Box marginY={4} fontSize={14}>
                  {i18n["import_description1"]}
                  <br />
                  {i18n["import_description2"]}
                </Box>
                <FileInput
                  accept=".json"
                  height="auto"
                  border="none"
                  onSelectFile={onSelectImportFile}
                />
              </Box>

              <Heading as="h2" fontSize={16} marginTop={8}>
                <Icon as={FaDownload} /> {i18n["ExportRules"]}
              </Heading>
              <Box margin={2} marginLeft={6}>
                <Box marginY={4} fontSize={14}>
                  {i18n["export_description"]}
                </Box>
                <Button
                  leftIcon={<Icon as={FaFileDownload} w={4} h={4} />}
                  variant="outline"
                  size="sm"
                  onClick={onExport}
                >
                  {i18n["Export"]}
                </Button>
              </Box>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                variant="outline"
                size="sm"
                onClick={onClose}
                ml={3}
              >
                {i18n["Close"]}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <ImportConfirmationDialog ref={openConfirmationDialogRef} i18n={i18n} />
    </>
  );
};
