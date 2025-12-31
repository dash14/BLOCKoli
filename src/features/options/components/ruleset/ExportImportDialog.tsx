import React, { useRef } from "react";
import {
  Box,
  Button,
  Dialog,
  Heading,
  Icon,
  useDisclosure,
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
  isEnableExport: boolean;
  onExport: () => void;
  onImport: (file: File) => void;
  i18n: I18nMessageMap;
};

export const ExportImportDialog: React.FC<Props> = ({
  isEnableExport,
  onExport,
  onImport,
  i18n,
}) => {
  const { open, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const openConfirmationDialogRef = useRef<ImportConfirmationDialogHandle>();

  async function onSelectImportFile(file: File, input: HTMLInputElement) {
    const dialogRef = openConfirmationDialogRef.current;
    /* v8 ignore next -- @preserve */
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
      <Button variant="outline" size="sm" onClick={onOpen}>
        <Icon as={HiMiniArrowsUpDown} w={5} h={5} />
        {i18n["ImportAndExportRules"]}
      </Button>

      <Dialog.Root
        open={open}
        onOpenChange={(e) => !e.open && onClose()}
        initialFocusEl={() => cancelRef.current}
        role="alertdialog"
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxWidth="36rem">
            <Dialog.CloseTrigger />

            <Dialog.Body paddingTop={10} paddingX={10}>
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
                  variant="outline"
                  size="sm"
                  onClick={onExport}
                  disabled={!isEnableExport}
                >
                  <Icon as={FaFileDownload} w={4} h={4} />
                  {i18n["Export"]}
                </Button>
              </Box>
            </Dialog.Body>

            <Dialog.Footer>
              <Button
                ref={cancelRef}
                variant="outline"
                size="sm"
                onClick={onClose}
                ml={3}
              >
                {i18n["Close"]}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      <ImportConfirmationDialog ref={openConfirmationDialogRef} i18n={i18n} />
    </>
  );
};
