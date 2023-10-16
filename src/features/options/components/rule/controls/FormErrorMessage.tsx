import { FormErrorMessage } from "@chakra-ui/form-control";
import { VStack } from "@chakra-ui/layout";
import { ChakraProps } from "@chakra-ui/system";
import { I18nMessageMap } from "@/hooks/useI18n";

type Props = {
  messages: string[];
  i18n: I18nMessageMap;
} & ChakraProps;

function getI18n(text: string, i18n: I18nMessageMap) {
  const key = text.replace(/[- ]/g, "_").replace(/[^\w]/g, "");
  const translated = i18n[key];
  return translated ? translated : text;
}

export const FormErrorMessages: React.FC<Props> = ({
  messages,
  i18n,
  ...props
}) => {
  return (
    <FormErrorMessage as={VStack} alignItems="start" gap={0} {...props}>
      {messages.map((error) => (
        <div key={error}>{getI18n(error, i18n)}</div>
      ))}
    </FormErrorMessage>
  );
};
