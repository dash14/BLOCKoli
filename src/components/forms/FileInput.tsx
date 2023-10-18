import React from "react";
import { ChakraProps, Input, useMultiStyleConfig } from "@chakra-ui/react";

type Props = {
  accept: string;
  onSelectFile: (file: File, input: HTMLInputElement) => void;
} & ChakraProps;

export const FileInput: React.FC<Props> = ({
  onSelectFile,
  accept,
  ...props
}) => {
  const styles = useMultiStyleConfig("Button", {
    variant: "outline",
    size: "sm",
  });

  return (
    <Input
      type="file"
      accept={accept}
      padding={0}
      sx={{
        "::file-selector-button": {
          border: "none",
          outline: "none",
          mr: 2,
          ...styles,
        },
      }}
      onChange={(e) =>
        e.target.files?.length && onSelectFile(e.target.files[0], e.target)
      }
      {...props}
    />
  );
};
