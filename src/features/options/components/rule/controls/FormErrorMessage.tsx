import { Field, HTMLChakraProps, VStack } from "@chakra-ui/react";
import {
  I18nMessageMap,
  getLocalizedValidationErrorText,
} from "@/hooks/useI18n";

type Props = {
  messages: string[];
  i18n: I18nMessageMap;
} & Omit<HTMLChakraProps<"div">, "css">;

export const FormErrorMessages: React.FC<Props> = ({
  messages,
  i18n,
  ...props
}) => {
  return (
    <Field.ErrorText as={VStack} alignItems="start" gap={0} {...props}>
      {messages.map((error) => (
        <div key={error}>{getLocalizedValidationErrorText(error, i18n)}</div>
      ))}
    </Field.ErrorText>
  );
};
