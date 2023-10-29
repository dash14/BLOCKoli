import { FormErrorMessage } from "@chakra-ui/form-control";
import { VStack } from "@chakra-ui/layout";
import { ChakraProps } from "@chakra-ui/system";
import {
  I18nMessageMap,
  getLocalizedValidationErrorText,
} from "@/hooks/useI18n";

type Props = {
  messages: string[];
  i18n: I18nMessageMap;
} & ChakraProps;

export const FormErrorMessages: React.FC<Props> = ({
  messages,
  i18n,
  ...props
}) => {
  return (
    <FormErrorMessage as={VStack} alignItems="start" gap={0} {...props}>
      {messages.map((error) => (
        <div key={error}>{getLocalizedValidationErrorText(error, i18n)}</div>
      ))}
    </FormErrorMessage>
  );
};
