import { Heading, HTMLChakraProps, Text } from "@chakra-ui/react";

type Props = { as?: React.ElementType } & Omit<HTMLChakraProps<"h1">, "css">;

export const Brand: React.FC<Props> = (props) => {
  return (
    <Heading
      fontFamily="'Lalezar', cursive"
      fontWeight="normal"
      letterSpacing="0.02rem"
      paddingTop="0.25rem"
      lineHeight="1.2"
      {...props}
    >
      <Text as="span" color="#009B22">
        BLOCK
      </Text>
      <Text as="span" color="#95C900">
        oli
      </Text>
    </Heading>
  );
};
