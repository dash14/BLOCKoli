import {
  EventDispatchable,
  Events,
  EventsOf,
  ServiceBase,
} from "@/modules/core/service";
import {
  Message,
  BroadcastMessage,
  MessageProxy,
  RequestMessage,
  ResponseMessage,
} from "./types";
import logging from "@/modules/utils/logging";

const log = logging.getLogger("popup");

class EventListeners<T extends Events> {
  private handlerMap: Map<keyof T, Set<(value: T[keyof T]) => void>> =
    new Map();

  public add(event: keyof T, handler: (value: T[keyof T]) => void) {
    let handlers = this.handlerMap.get(event);
    if (!handlers) {
      handlers = new Set();
      this.handlerMap.set(event, handlers);
    }
    handlers.add(handler);
  }

  public remove(event: keyof T, handler: (value: T[keyof T]) => void) {
    const handlers = this.handlerMap.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  public removeAll() {
    this.handlerMap.clear();
  }

  public dispatch(event: keyof T, value: T[keyof T]): void[] {
    const handlers = this.handlerMap.get(event);
    return Array.from(handlers?.values() ?? []).map((handler) =>
      handler.call(null, value)
    );
  }
}

class BroadcastListeners<T extends Events> implements EventDispatchable<T> {
  private listeners = new EventListeners<T>();
  private service: string;
  private messageListener?: (
    message: Message,
    _sender: unknown,
    sendResponse: (param: boolean) => void
  ) => void;

  constructor(service: string) {
    this.service = service;
    this.messageListener = undefined;
  }

  addEventListener<K extends keyof T>(
    type: K,
    handler: (value: T[K]) => void
  ): void {
    this.listeners.add(type, handler as (value: T[keyof T]) => void);

    if (!this.messageListener) {
      this.messageListener = this.buildListener(this.listeners, this.service);
      chrome.runtime.onMessage.addListener(this.messageListener);
    }
  }

  removeAllEventListeners(): void {
    this.listeners.removeAll();
    if (this.messageListener) {
      chrome.runtime.onMessage.removeListener(this.messageListener);
      this.messageListener = undefined;
    }
  }

  private buildListener(listeners: EventListeners<T>, service: string) {
    return (
      message: Message,
      _sender: unknown,
      sendResponse: (param: boolean) => void
    ) => {
      if (message.type !== "broadcast") return;
      const broadcast = message as BroadcastMessage<T>;
      if (broadcast.service !== service) return;
      listeners.dispatch(broadcast.event, broadcast.message);
      sendResponse(true);
    };
  }
}

export class MessageProxyFactory {
  public create<T extends ServiceBase>(service: string): MessageProxy<T> {
    const baseObject = new BroadcastListeners<EventsOf<T>>(service);
    return new Proxy(baseObject, {
      get: (target, prop) => {
        if (prop in target) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (target as any)[prop];
        }

        // default implementation
        return async (...args: unknown[]) => {
          const request: RequestMessage = {
            type: "request",
            service,
            method: prop.toString(),
            args,
          };
          const response = (await chrome.runtime.sendMessage(
            request
          )) as ResponseMessage;

          log.debug("response", response);

          if (!response) {
            throw new Error("No response from service worker");
          }
          if (response.type !== "response") {
            throw new Error(
              "Malformed message. message: " + JSON.stringify(response)
            );
          }
          if (response.success) {
            return response.result;
          } else {
            throw response.error;
          }
        };
      },
    }) as unknown as MessageProxy<T>;
  }
}
