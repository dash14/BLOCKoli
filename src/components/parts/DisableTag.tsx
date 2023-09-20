import { ReactNode } from "react";
import { ChakraProps, Tag } from "@chakra-ui/react";

type Props = { children: ReactNode } & ChakraProps;

export const DisableTag: React.FC<Props> = ({ children, ...props }) => {
  return (
    <Tag fontWeight="normal" color="#777" justifyContent="center" {...props}>
      {children}
    </Tag>
  );
};
