// A hook for defining keys for an Array whose elements have no id

import { useEffect, useRef, useState } from "react";
import { push, removeAt } from "@/modules/core/array";

export function useArrayKey(initialLength: number) {
  const [elementKeys, setElementKeys] = useState<number[]>([]);
  const nextIdRef = useRef(1);

  useEffect(() => {
    resetElementLength(initialLength);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetElementLength(length: number) {
    setElementKeys([...Array(length)].map(() => nextIdRef.current++));
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
