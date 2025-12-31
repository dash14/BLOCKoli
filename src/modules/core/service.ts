export type Events = object;

export type Service = object;

export interface EventDispatchable<T> {
  addEventListener<K extends keyof T>(
    type: K,
    handler: (value: T[K]) => void
  ): void;
  removeEventListener<K extends keyof T>(
    type: K,
    handler: (value: T[K]) => void
  ): void;
  removeAllEventListeners(): void;
}

export type ServiceClient<T extends Service, E extends Events> = T &
  EventDispatchable<E>;

export interface EventEmitter<T extends Events> {
  emit<K extends keyof T>(event: K, message: T[K]): Promise<void>;
}

export abstract class ServiceBase<E extends Events = object> {
  protected emitter: EventEmitter<E>;
  constructor(emitter: EventEmitter<E>) {
    this.emitter = emitter;
  }

  public abstract start(): Promise<void>;
}

export type EventsOf<T> = T extends ServiceBase<infer E> ? E : never;
