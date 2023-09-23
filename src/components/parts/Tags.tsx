import { ChakraProps, HStack, Tag } from "@chakra-ui/react";
import { DisableTag } from "./DisableTag";

type Props = {
  empty: string;
  values: string[] | undefined;
  emptyWidth?: number;
} & ChakraProps;

export const Tags: React.FC<Props> = ({
  empty,
  values,
  emptyWidth,
  ...props
}) => {
  if (!values || values.length === 0) {
    return (
      <DisableTag width={emptyWidth && `${emptyWidth}px`} {...props}>
        {empty}
      </DisableTag>
    );
  }
  return (
    <HStack {...props}>
      {values.map((value) => (
        <Tag key={value}>{value}</Tag>
      ))}
    </HStack>
  );
};
