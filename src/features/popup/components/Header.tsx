import { HStack, HTMLChakraProps } from "@chakra-ui/react";
import { Brand } from "@/components/brand/Brand";
import { BrandIcon } from "@/components/brand/BrandIcon";

type Props = Omit<HTMLChakraProps<"header">, "css" | "direction">;

export const Header: React.FC<Props> = (props) => {
  return (
    <HStack
      as="header"
      backgroundColor="#f6ffe7"
      padding="6px 20px"
      justifyContent="space-between"
      borderBottom="1px solid #d6dFc7"
      {...props}
    >
      <Brand as="h1" fontSize={28} />
      <BrandIcon marginLeft="4px" />
    </HStack>
  );
};
