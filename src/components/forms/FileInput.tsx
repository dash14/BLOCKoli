import React from "react";
import { HTMLChakraProps, Input } from "@chakra-ui/react";

type Props = {
  accept: string;
  onSelectFile: (file: File, input: HTMLInputElement) => void;
} & Omit<HTMLChakraProps<"input">, "css" | "onChange">;

export const FileInput: React.FC<Props> = ({
  onSelectFile,
  accept,
  ...props
}) => {
  return (
    <Input
      type="file"
      accept={accept}
      padding={0}
      css={{
        "::file-selector-button": {
          border: "none",
          outline: "none",
          marginRight: "0.5rem",
          padding: "0.25rem 0.75rem",
          borderRadius: "0.375rem",
          fontSize: "0.875rem",
          fontWeight: "500",
          backgroundColor: "transparent",
          cursor: "pointer",
          "&:hover": {
            backgroundColor: "var(--chakra-colors-gray-100)",
          },
        },
      }}
      onChange={(e) =>
        e.target.files?.length && onSelectFile(e.target.files[0], e.target)
      }
      {...props}
    />
  );
};
