export function push<T>(list: T[], item: T): T[] {
  return [...list, item];
}

export function removeAt<T>(list: T[], index: number): T[] {
  return list.filter((_, i) => i !== index);
}

export function replaceAt<T>(list: T[], index: number, item: T): T[] {
  return list.map((v, i) => (i === index ? item : v));
}
