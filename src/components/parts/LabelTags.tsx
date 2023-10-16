import { ChakraProps } from "@chakra-ui/react";
import { Tags } from "./Tags";

type Props = {
  empty: string;
  options: { label: string; value: string }[];
  values?: string[];
  maxWidth: number;
} & ChakraProps;

export const LabelTags: React.FC<Props> = ({
  empty,
  options,
  values,
  maxWidth,
  ...props
}) => {
  const labels = options
    .filter((o) => values?.includes(o.value))
    .map((o) => o.label);

  return <Tags empty={empty} values={labels} maxWidth={maxWidth} {...props} />;
};
