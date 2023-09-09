import { ReactNode } from "react";
import {
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from "@chakra-ui/react";
import { QuestionIcon } from "@chakra-ui/icons";

type Props = {
  width: number;
  title: string;
  children: ReactNode;
};

export const HintPopover: React.FC<Props> = ({ width, title, children }) => {
  return (
    <Popover>
      <PopoverTrigger>
        <IconButton
          icon={<QuestionIcon />}
          aria-label="hint"
          size="sm"
          variant="ghost"
        />
      </PopoverTrigger>
      <PopoverContent width={width}>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader fontSize={14}>{title}</PopoverHeader>
        <PopoverBody fontSize={14}>{children}</PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
