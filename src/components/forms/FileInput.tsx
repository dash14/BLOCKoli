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
        appearance: "none",
        "&::file-selector-button": {
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "var(--chakra-colors-blue-500)",
          borderRadius: "var(--chakra-radii-l2)",
          color: "var(--chakra-colors-blue-600)",
          outline: "none",
          marginRight: "0.5rem",
          padding: "0.25rem 0.75rem",
          fontSize: "var(--chakra-font-sizes-sm)",
          fontWeight: "var(--chakra-font-weights-semibold)",
          backgroundColor: "transparent",
          cursor: "pointer",
        },
        "&::file-selector-button:hover": {
          backgroundColor: "var(--chakra-colors-blue-50)",
        },
        "&::file-selector-button:active": {
          backgroundColor: "var(--chakra-colors-blue-100)",
        },
      }}
      onChange={(e) =>
        e.target.files?.length && onSelectFile(e.target.files[0], e.target)
      }
      {...props}
    />
  );
};
