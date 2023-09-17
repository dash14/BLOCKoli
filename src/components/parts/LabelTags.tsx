import { HStack, Tag } from "@chakra-ui/react";

type Props = {
  empty: string;
  options: { label: string; value: string }[];
  values?: string[];
};

export const LabelTags: React.FC<Props> = ({ empty, options, values }) => {
  if (!values) {
    return <Tag>{empty}</Tag>;
  }

  const labels = options
    .filter((o) => values.includes(o.value))
    .map((o) => o.label);
  if (labels.length === 0) {
    return <Tag>{empty}</Tag>;
  }

  return (
    <HStack>
      {labels.map((label) => (
        <Tag key={label}>{label}</Tag>
      ))}
    </HStack>
  );
};
