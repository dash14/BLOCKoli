import { HStack, Tag } from "@chakra-ui/react";

type Props = {
  empty: string;
  values: string[] | undefined;
};

export const Tags: React.FC<Props> = ({ empty, values }) => {
  if (!values || values.length === 0) {
    return <Tag>{empty}</Tag>;
  }
  return (
    <HStack>
      {values.map((value) => (
        <Tag key={value}>{value}</Tag>
      ))}
    </HStack>
  );
};
