import { HStack, Icon, Link, Text } from "@chakra-ui/react";
import { FaGithub } from "react-icons/fa";

export const Copyright: React.FC = () => {
  return (
    <HStack justifyContent="center" alignItems="center">
      <Text as="span">Copyright &copy; 2023 dash14.ack</Text>
      <Link
        href="https://github.com/dash14/BLOCKoli"
        target="_blank"
        rel="noopener"
        display="inline-flex"
        alignItems="center"
      >
        <Icon as={FaGithub} boxSize={4} margin={0} padding={0} color="#aaa" />
      </Link>
    </HStack>
  );
};
