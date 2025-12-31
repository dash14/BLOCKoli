// A hook for defining keys for an Array whose elements have no id

import { useRef, useState } from "react";
import { push, removeAt } from "@/modules/core/array";

function generateKeys(
  length: number,
  nextIdRef: React.MutableRefObject<number>
): number[] {
  return [...Array(length)].map(() => nextIdRef.current++);
}

export function useArrayKey(initialLength: number) {
  const nextIdRef = useRef(1);
  const [elementKeys, setElementKeys] = useState<number[]>(() =>
    generateKeys(initialLength, nextIdRef)
  );

  function resetElementLength(length: number) {
    setElementKeys(generateKeys(length, nextIdRef));
  }

  function pushElementKey() {
    setElementKeys(push(elementKeys, nextIdRef.current++));
  }

  function removeElementKeyAt(index: number) {
    setElementKeys(removeAt(elementKeys, index));
  }

  return {
    elementKeys,
    resetElementLength,
    pushElementKey,
    removeElementKeyAt,
  };
}
