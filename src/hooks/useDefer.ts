import { useState } from "react";

type ResolveFunc<T> = (result: T) => void;
type ResolveObject<T> = { resolve: ResolveFunc<T> };

export function useDefer<T>() {
  const [resolver, setResolver] = useState<ResolveObject<T> | null>(null);

  function promise() {
    return new Promise<T>((resolve) => {
      setResolver({ resolve });
    });
  }

  function resolve(value: T) {
    if (resolver) {
      resolver.resolve(value);
    }
  }

  return {
    promise,
    resolve,
  };
}
