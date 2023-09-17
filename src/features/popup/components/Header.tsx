import { ChakraProps, HStack, Img } from "@chakra-ui/react";
import { Brand } from "@/components/brand/Brand";
import { BrandIcon } from "@/components/brand/BrandIcon";

type Props = ChakraProps;

export const Header: React.FC<Props> = (props) => {
  return (
    <HStack
      as="header"
      backgroundColor="#f6ffe7"
      padding="10px 24px"
      justifyContent="space-between"
      borderBottom="1px solid #d6dFc7;"
      {...props}
    >
      <Brand as="h1" fontSize={24} />
      <BrandIcon marginLeft="4px" />
    </HStack>
  );
};
