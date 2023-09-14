import { ChakraProps, HStack, Heading, Img } from "@chakra-ui/react";

type Props = ChakraProps;

export const Header: React.FC<Props> = ({ ...props }) => {
  return (
    <HStack
      as="header"
      backgroundColor="#F6FFE7"
      padding="10px 24px"
      justifyContent="space-between"
      borderBottom="1px solid #ddd;"
      {...props}
    >
      <Heading as="h1" fontSize="22px">
        BLOCKoli
      </Heading>
      <Img
        src="images/icon32.png"
        srcSet="images/icon32.png 1x, images/icon32@2x.png 2x"
        width="32px"
        height="32px"
        marginLeft="4px"
      />
    </HStack>
  );
};
