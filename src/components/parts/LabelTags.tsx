import { useEffect, useRef, useState } from "react";
import { ChakraProps, HStack, Tag } from "@chakra-ui/react";
import { DisableTag } from "./DisableTag";

type Props = {
  empty: string;
  options: { label: string; value: string }[];
  values?: string[];
  emptyWidth?: number;
  maxWidth: number;
} & ChakraProps;

export const LabelTags: React.FC<Props> = ({
  empty,
  options,
  values,
  emptyWidth,
  maxWidth,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<"auto" | number>("auto");

  const labels = options
    .filter((o) => values?.includes(o.value))
    .map((o) => o.label);

  const gap = 5;

  useEffect(() => {
    // Adjust width dynamically
    const element = ref.current as HTMLDivElement;
    const observer = new ResizeObserver(() => {
      const widthList = Array.from(element.children).map((elm) => {
        const div = elm as HTMLDivElement;
        return div.getBoundingClientRect().width;
      });
      if (widthList.length === 0) return;
      let currentWidth = widthList.shift() ?? 0;
      for (const width of widthList) {
        const newWidth = currentWidth + gap + width;
        if (newWidth > maxWidth) {
          break;
        }
        currentWidth = newWidth;
      }
      setWidth(Math.ceil(currentWidth));
    });
    // observer.observe(element);
    Array.from(element.children).forEach((elm) => observer.observe(elm));

    return () => {
      observer.disconnect();
    };
  }, [ref, maxWidth]);

  return (
    <HStack
      ref={ref}
      position="relative"
      flexWrap="wrap"
      flex="1"
      maxWidth={width}
      gap={`${gap}px`}
      {...props}
    >
      {labels.length === 0 ? (
        <DisableTag
          width={emptyWidth && `${emptyWidth}px`}
          justifyContent="center"
        >
          {empty}
        </DisableTag>
      ) : (
        labels.map((label) => <Tag key={label}>{label}</Tag>)
      )}
    </HStack>
  );
};
