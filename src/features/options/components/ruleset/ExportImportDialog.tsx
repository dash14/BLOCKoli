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
import {
  ImportConfirmationDialog,
  ImportConfirmationDialogHandle,
} from "./ImportConfirmationDialog";

type Props = {
  onExport: () => void;
  onImport: (file: File) => void;
};

export const ExportImportDialog: React.FC<Props> = ({ onExport, onImport }) => {
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
        Export and Import
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
                <Icon as={FaDownload} /> Export to file:
              </Heading>
              <Box margin={2} marginLeft={6}>
                <Box marginY={4} fontSize={14}>
                  すべての設定をJSON形式でエクスポートします。
                </Box>
                <Button
                  leftIcon={<Icon as={FaFileDownload} w={4} h={4} />}
                  variant="outline"
                  size="sm"
                  onClick={onExport}
                >
                  Export
                </Button>
              </Box>

              <Heading as="h2" fontSize={16} marginTop={8}>
                <Icon as={FaUpload} /> Import from file:
              </Heading>
              <Box margin={2} marginLeft={6}>
                <Box marginY={4} fontSize={14}>
                  エクスポートしたファイルを読み込み、設定に追加します。
                  <br />
                  同じ名前のルールセットは上書きします。
                </Box>
                <FileInput
                  accept=".json"
                  height="auto"
                  border="none"
                  onSelectFile={onSelectImportFile}
                />
              </Box>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                variant="ghost"
                size="sm"
                onClick={onClose}
                ml={3}
              >
                Close
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <ImportConfirmationDialog ref={openConfirmationDialogRef} />
    </>
  );
};
