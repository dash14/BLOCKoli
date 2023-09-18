import { As, ChakraProps, Heading } from "@chakra-ui/react";

type Props = { as?: As } & ChakraProps;

export const Brand: React.FC<Props> = (props) => {
  return (
    <Heading
      fontFamily="'Lalezar', cursive"
      letterSpacing="0.5px"
      color="#2d2d2d"
      paddingTop="0.25rem"
      {...props}
    >
      BLOCKoli
    </Heading>
  );
};
