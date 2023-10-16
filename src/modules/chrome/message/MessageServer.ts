import { EventEmitter, EventsOf, ServiceBase } from "@/modules/core/service";
import {
  Message,
  BroadcastMessage,
  RequestMessage,
  ResponseMessage,
} from "./types";

export class MessageServer<T extends ServiceBase>
  implements EventEmitter<EventsOf<T>>
{
  private serviceId: string;
  private isStarted = false;

  constructor(serviceId: string) {
    this.serviceId = serviceId;
  }

  public start(serviceObject: ServiceBase) {
    if (this.isStarted) return;
    this.isStarted = true;
    chrome.runtime.onMessage.addListener(
      this.buildMessageListener(serviceObject)
    );
    serviceObject.start();
  }

  public async emit(
    event: keyof EventsOf<T>,
    message: EventsOf<T>[keyof EventsOf<T>]
  ): Promise<void> {
    const broadcast: BroadcastMessage<EventsOf<T>> = {
      type: "broadcast",
      service: this.serviceId,
      event,
      message,
    };
    await chrome.runtime.sendMessage(broadcast);
  }

  private buildMessageListener(serviceObject: unknown) {
    return (
      message: Message,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (message: ResponseMessage) => void
    ): boolean => {
      if (message.type !== "request") {
        sendResponse({
          type: "response",
          success: false,
          error: "Malformed message. message: " + JSON.stringify(message),
        });
        return false;
      }

      if (!this.isStarted) {
        sendResponse({
          type: "response",
          success: false,
          error: "Message server is not started.",
        });
        return false;
      }

      const request = message as RequestMessage;

      const service = serviceObject as Record<
        string,
        (...args: unknown[]) => unknown
      >;

      const method = service[request.method];
      if ("function" !== typeof method) {
        sendResponse({
          type: "response",
          success: false,
          error: `Not found "${request.method}" in "${request.service}" service.`,
        });
        return false;
      }

      let result;
      try {
        result = method.call(service, ...request.args);
      } catch (error: unknown) {
        sendResponse({
          type: "response",
          success: false,
          error: String(error),
        });
        return false;
      }

      if (result instanceof Promise) {
        result
          .then((value) => {
            sendResponse({
              type: "response",
              success: true,
              result: value,
            });
          })
          .catch((error) => {
            sendResponse({
              type: "response",
              success: false,
              error: String(error),
            });
          });
        return true; // async
      }

      sendResponse({
        type: "response",
        success: true,
        result,
      });

      return false;
    };
  }
}
