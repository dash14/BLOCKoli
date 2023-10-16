import { ReactNode } from "react";
import { QuestionIcon } from "@chakra-ui/icons";
import {
  ChakraProps,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "@chakra-ui/react";

type Props = {
  title: string;
  children: ReactNode;
  contentWidth: number;
} & ChakraProps;

export const HintPopover: React.FC<Props> = ({
  contentWidth,
  title,
  children,
  ...props
}) => {
  return (
    <Popover>
      <PopoverTrigger>
        <IconButton
          icon={<QuestionIcon />}
          aria-label="hint"
          size="sm"
          variant="ghost"
          {...props}
        />
      </PopoverTrigger>
      <PopoverContent width={contentWidth}>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader fontSize={14}>{title}</PopoverHeader>
        <PopoverBody fontSize={14} paddingX={4} paddingY={3}>
          {children}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
