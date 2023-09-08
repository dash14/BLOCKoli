import { ComponentProps } from "react";
import { MultiValue, Select } from "chakra-react-select";

type Option = { label: string; value: string };
type SelectComponentProps = ComponentProps<typeof Select<Option, true>>;

type Props = {
  placeholder: string;
  options: { label: string; value: string }[];
  value?: string[];
  onChange?: (values: string[]) => void;
};
export const MultipleSelect: React.FC<Props> = ({
  placeholder,
  options,
  value,
  onChange,
}) => {
  // value: string[] --> { label: string, value: string }[]
  const selectValue =
    (value
      ?.map((v) => options.find((o) => o.value === v))
      .filter(Boolean) as MultiValue<Option>) ?? [];

  const onChangeValue = (newValue: MultiValue<Option>) => {
    onChange?.(newValue.map((v) => v.value));
  };

  const props: SelectComponentProps = {
    // @ts-ignore
    selectedOptionStyle: "check",
    placeholder,
    options,
    menuPortalTarget: document.body,
    classNamePrefix: "chakra-react-select",
    hideSelectedOptions: false,
    isMulti: true,
    closeMenuOnSelect: false,
    value: selectValue,
    onChange: onChangeValue,
  };

  return <Select {...props} />;
};
