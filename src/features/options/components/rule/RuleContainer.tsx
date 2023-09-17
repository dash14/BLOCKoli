import { ReactNode } from "react";
import { Box } from "@chakra-ui/react";

type Props = {
  isEditing?: boolean;
  children: ReactNode;
};

export const RuleContainer: React.FC<Props> = ({
  isEditing = false,
  children,
}) => {
  return (
    <Box
      position="relative"
      paddingX={6}
      paddingY={4}
      border="solid 1px #dfdfdf"
      borderRadius={10}
      {...(isEditing && {
        border: "solid 10px",
        borderColor: "blue.100",
      })}
      transition="border 0.2s linear"
    >
      {children}
    </Box>
  );
};
