import {
  EventDispatchable,
  EventsBase,
  ServiceBase,
} from "@/modules/services/interfaces/core";
import {
  Message,
  BroadcastMessage,
  MessageProxy,
  RequestMessage,
  ResponseMessage,
} from "./types";

class EventListeners<T extends EventsBase> {
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

  public dispatch(event: keyof T, value: T[keyof T]): void[] {
    const handlers = this.handlerMap.get(event);
    return Array.from(handlers?.values() ?? []).map((handler) =>
      handler.call(null, value)
    );
  }
}

class BroadcastListeners<T extends EventsBase> implements EventDispatchable<T> {
  private listeners = new EventListeners<T>();

  constructor(service: string) {
    chrome.runtime.onMessage.addListener(
      (message: Message, _sender, sendResponse) => {
        if (message.type !== "broadcast") return;
        const broadcast = message as BroadcastMessage<T>;
        if (broadcast.service !== service) return;
        this.listeners.dispatch(broadcast.event, broadcast.message);
        sendResponse(true);
      }
    );
  }
  addEventListener<K extends keyof T>(
    type: K,
    handler: (value: T[K]) => void
  ): void {
    this.listeners.add(type, handler as (value: T[keyof T]) => void);
  }
}

export class MessageProxyFactory {
  public create<T extends ServiceBase, E extends EventsBase>(
    service: string
  ): MessageProxy<T, E> {
    const baseObject = new BroadcastListeners<E>(service);
    return new Proxy(baseObject, {
      get: (target, prop) => {
        if (prop in target) {
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
          console.log("response:", response);
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
    }) as unknown as MessageProxy<T, E>;
  }
}
