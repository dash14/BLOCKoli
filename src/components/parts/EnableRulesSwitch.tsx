import { Switch } from "@chakra-ui/react";
import { useI18n } from "@/hooks/useI18n";

// Layout props only; the css prop of Chakra and Emotion conflict when spread
type Props = Pick<Switch.RootProps, "display" | "justifyContent" | "gap" | "marginTop"> & {
  checked: boolean;
  onChange: (checked: boolean) => void;
  fontSize: number;
};

export const EnableRulesSwitch: React.FC<Props> = ({
  checked,
  onChange,
  fontSize,
  ...rootProps
}) => {
  const i18n = useI18n();
  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={(e) => onChange(e.checked)}
      {...rootProps}
    >
      <Switch.HiddenInput />
      {/* Plain body text rather than the recipe's small label */}
      <Switch.Label
        fontSize={fontSize}
        fontWeight="normal"
        lineHeight="inherit"
        cursor="pointer"
      >
        {i18n["EnableRules"]}
      </Switch.Label>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
    </Switch.Root>
  );
};
