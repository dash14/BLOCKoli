import { HTMLChakraProps, Image } from "@chakra-ui/react";

type Props = Omit<HTMLChakraProps<"img">, "css">;

export const BrandIcon: React.FC<Props> = (props) => {
  return (
    <Image
      src="images/icon32.png"
      srcSet="images/icon32.png 1x, images/icon32@2x.png 2x"
      width="32px"
      height="32px"
      {...props}
    />
  );
};
