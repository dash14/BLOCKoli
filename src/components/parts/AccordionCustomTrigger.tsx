import { ReactNode, useRef } from "react";
import { HStack, HTMLChakraProps } from "@chakra-ui/react";
import { useAccordionContext, useAccordionItemContext } from "@chakra-ui/react";

type Props = { children: ReactNode } & Omit<HTMLChakraProps<"div">, "css">;

export const AccordionCustomTrigger: React.FC<Props> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const accordion = useAccordionContext();
  const item = useAccordionItemContext();
  const handleClick = (e: React.MouseEvent) => {
    if (!containerRef.current?.contains(e.target as Node)) {
      return;
    }
    if (item.expanded) {
      accordion.setValue([]);
    } else {
      accordion.setValue(["0"]);
    }
  };

  return (
    <HStack
      width="100%"
      paddingTop={2}
      paddingBottom={2}
      paddingLeft={2}
      paddingRight={4}
      cursor="pointer"
      onClick={handleClick}
      css={{
        "&:hover": {
          backgroundColor: "var(--chakra-colors-black-alpha-50)",
        },
      }}
      ref={containerRef}
    >
      {children}
    </HStack>
  );
};
