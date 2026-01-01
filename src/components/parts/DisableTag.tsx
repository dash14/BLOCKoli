import { ReactNode } from "react";
import { HTMLChakraProps, Tag } from "@chakra-ui/react";

type Props = { children: ReactNode } & Omit<HTMLChakraProps<"span">, "css">;

export const DisableTag: React.FC<Props> = ({ children, ...props }) => {
  return (
    <Tag.Root
      fontWeight="normal"
      color="#777"
      justifyContent="center"
      {...props}
    >
      <Tag.Label>{children}</Tag.Label>
    </Tag.Root>
  );
};
