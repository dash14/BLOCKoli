import { useEffect, useRef, useState } from "react";
import { ChakraProps, HStack, Tag } from "@chakra-ui/react";
import { DisableTag } from "./DisableTag";

type Props = {
  empty: string;
  options: { label: string; value: string }[];
  values?: string[];
  emptyWidth?: number;
} & ChakraProps;

export const LabelTags: React.FC<Props> = ({
  empty,
  options,
  values,
  emptyWidth,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<"auto" | number>("auto");

  const labels = options
    .filter((o) => values?.includes(o.value))
    .map((o) => o.label);

  useEffect(() => {
    // Adjust width dynamically
    const element = ref.current as HTMLDivElement;
    const observer = new ResizeObserver(() => {
      const newWidth = Array.from(element.children).reduce((newWidth, elm) => {
        const div = elm as HTMLDivElement;
        return Math.max(div.offsetLeft + div.offsetWidth, newWidth);
      }, 0);
      if (newWidth > 0) {
        setWidth(newWidth + 1); // 1: additional margin
      }
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return (
    <HStack
      ref={ref}
      position="relative"
      flexWrap="wrap"
      flex="1"
      maxWidth={width}
      gap="5px"
      {...props}
    >
      {labels.length === 0 ? (
        <DisableTag width={`${emptyWidth}px`} justifyContent="center">
          {empty}
        </DisableTag>
      ) : (
        labels.map((label) => <Tag key={label}>{label}</Tag>)
      )}
    </HStack>
  );
};
