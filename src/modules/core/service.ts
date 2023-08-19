export type EventsBase = object;

export type ServiceBase = object;

export interface EventDispatchable<T> {
  addEventListener<K extends keyof T>(
    type: K,
    handler: (value: T[K]) => void
  ): void;
}

export type ServiceClient<T extends ServiceBase, E extends EventsBase> = T &
  EventDispatchable<E>;

export interface EventEmitter<T extends EventsBase> {
  broadcast<K extends keyof T>(event: K, message: T[K]): Promise<void>;
}

export class Service<E extends EventsBase = object> {
  protected broadcaster: EventEmitter<E>;
  constructor(broadcaster: EventEmitter<E>) {
    this.broadcaster = broadcaster;
  }
}
