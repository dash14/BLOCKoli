import { useEffect, useRef, useState } from "react";
import { ChakraProps, HStack, Tag } from "@chakra-ui/react";
import { DisableTag } from "./DisableTag";

type Props = {
  empty: string;
  values: string[];
  maxWidth: number;
} & ChakraProps;

export const Tags: React.FC<Props> = ({
  empty,
  values,
  maxWidth,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<"auto" | number>("auto");

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
      maxWidth={values.length > 0 ? width : "auto"}
      gap={`${gap}px`}
      {...props}
    >
      {values.length === 0 ? (
        <DisableTag justifyContent="center">{empty}</DisableTag>
      ) : (
        values.map((label) => <Tag key={label}>{label}</Tag>)
      )}
    </HStack>
  );
};
