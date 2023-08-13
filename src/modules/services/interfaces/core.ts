export interface EventDispatchable<T> {
  addEventListener<K extends keyof T>(
    type: K,
    handler: (value: T[K]) => void
  ): void;
}

export interface Broadcaster<T> {
  broadcast<K extends keyof T & string>(event: K, message: T[K]): Promise<void>;
}
