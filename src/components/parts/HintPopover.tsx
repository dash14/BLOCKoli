import { ReactNode } from "react";
import { HTMLChakraProps, IconButton, Popover } from "@chakra-ui/react";
import { LuCircleHelp } from "react-icons/lu";

type Props = {
  title: string;
  children: ReactNode;
  contentWidth: number;
} & Omit<HTMLChakraProps<"button">, "css">;

export const HintPopover: React.FC<Props> = ({
  contentWidth,
  title,
  children,
  ...props
}) => {
  return (
    <Popover.Root positioning={{ strategy: "fixed", hideWhenDetached: true }}>
      <Popover.Trigger asChild>
        <IconButton aria-label="hint" size="sm" variant="ghost" {...props}>
          <LuCircleHelp />
        </IconButton>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content width={contentWidth}>
          <Popover.Arrow>
            <Popover.ArrowTip />
          </Popover.Arrow>
          <Popover.Header fontSize={14}>{title}</Popover.Header>
          <Popover.Body fontSize={14} paddingX={4} paddingY={3}>
            {children}
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
};
