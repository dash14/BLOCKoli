import { EventDispatchable } from "@/modules/services/interfaces/core";
import {
  Message,
  MessageBroadcast,
  MessageProxy,
  MessageRequest,
  MessageResponse,
} from "./types";

class EventListeners {
  private handlerMap: Map<string, Set<(...args: unknown[]) => unknown>> =
    new Map();

  public add(event: string, handler: (...args: unknown[]) => unknown) {
    let handlers = this.handlerMap.get(event);
    if (!handlers) {
      handlers = new Set();
      this.handlerMap.set(event, handlers);
    }
    handlers.add(handler);
  }

  public remove(event: string, handler: (...args: unknown[]) => unknown) {
    const handlers = this.handlerMap.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  public dispatch(event: string, message: unknown): unknown[] {
    const handlers = this.handlerMap.get(event);
    return Array.from(handlers?.values() ?? []).map((handler) =>
      handler.call(null, message)
    );
  }
}

class BroadcastListeners<E> implements EventDispatchable<E> {
  private listeners = new EventListeners();

  constructor(service: string) {
    chrome.runtime.onMessage.addListener(
      (request: Message, _sender, sendResponse) => {
        if (request.type !== "broadcast") return;
        const broadcast = request as MessageBroadcast;
        if (broadcast.service !== service) return;
        this.listeners.dispatch(broadcast.event, broadcast.message);
        sendResponse(true);
      }
    );
  }
  addEventListener<K extends keyof E>(
    type: K,
    handler: (value: E[K]) => void
  ): void {
    this.listeners.add(type as string, handler as any);
  }
}

export class MessageProxyFactory {
  public create<T, E>(service: string): MessageProxy<T, E> {
    const baseObject = new BroadcastListeners<E>(service);
    return new Proxy(baseObject, {
      get: (target, prop) => {
        if (prop in target) {
          return (target as any)[prop];
        }

        // default implementation
        return async (...args: unknown[]) => {
          const request: MessageRequest = {
            type: "request",
            service,
            method: prop.toString(),
            args,
          };
          const response = (await chrome.runtime.sendMessage(
            request
          )) as MessageResponse;
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
