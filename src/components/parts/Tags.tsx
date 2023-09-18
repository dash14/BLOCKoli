import { ChakraProps, HStack, Tag } from "@chakra-ui/react";
import { DisableTag } from "./DisableTag";

type Props = {
  empty: string;
  values: string[] | undefined;
} & ChakraProps;

export const Tags: React.FC<Props> = ({ empty, values, ...props }) => {
  if (!values || values.length === 0) {
    return <DisableTag {...props}>{empty}</DisableTag>;
  }
  return (
    <HStack {...props}>
      {values.map((value) => (
        <Tag key={value}>{value}</Tag>
      ))}
    </HStack>
  );
};
