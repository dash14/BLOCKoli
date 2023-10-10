export function uniqueObjects<T>(list: T[]): T[] {
  const map = new Map<string, T>();
  for (const value of list) {
    const key = JSON.stringify(value);
    if (!map.has(key)) {
      map.set(key, value);
    }
  }
  return Array.from(map.values());
}
