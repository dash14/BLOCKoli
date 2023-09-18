import { As, ChakraProps, Heading, Text } from "@chakra-ui/react";

type Props = { as?: As } & ChakraProps;

export const Brand: React.FC<Props> = (props) => {
  return (
    <Heading
      fontFamily="'Lalezar', cursive"
      fontWeight="normal"
      letterSpacing="0.02rem"
      paddingTop="0.25rem"
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
