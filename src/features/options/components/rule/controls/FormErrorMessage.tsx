import { FormErrorMessage } from "@chakra-ui/form-control";
import { VStack } from "@chakra-ui/layout";
import { ChakraProps } from "@chakra-ui/system";

type Props = {
  messages: string[];
} & ChakraProps;

export const FormErrorMessages: React.FC<Props> = ({ messages, ...props }) => {
  return (
    <FormErrorMessage as={VStack} alignItems="start" gap={0} {...props}>
      {messages.map((error) => (
        <div key={error}>{error}</div>
      ))}
    </FormErrorMessage>
  );
};
