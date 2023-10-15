import { FormErrorMessage } from "@chakra-ui/form-control";
import { ChakraProps } from "@chakra-ui/system";

type Props = {
  messages: string[];
} & ChakraProps;

export const FormErrorMessages: React.FC<Props> = ({ messages, ...props }) => {
  return (
    <FormErrorMessage {...props}>
      {messages.map((error) => (
        <div key={error}>{error}</div>
      ))}
    </FormErrorMessage>
  );
};
