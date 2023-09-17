import { ChakraProps, Img } from "@chakra-ui/react";

type Props = ChakraProps;

export const BrandIcon: React.FC<Props> = (props) => {
  return (
    <Img
      src="images/icon32.png"
      srcSet="images/icon32.png 1x, images/icon32@2x.png 2x"
      width="32px"
      height="32px"
      {...props}
    />
  );
};
