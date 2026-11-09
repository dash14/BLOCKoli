import { ServiceError } from "@/modules/core/ServiceError";
import { EventEmitter, EventsOf, ServiceBase } from "@/modules/core/service";
import logging from "@/modules/utils/logging";
import {
  Message,
  BroadcastMessage,
  ErrorResponseMessage,
  RequestMessage,
  ResponseMessage,
} from "./types";

const log = logging.getLogger("message");

// Chrome rejects a broadcast with this when neither the popup nor the options page is open.
const NO_RECEIVER_ERROR = "Receiving end does not exist.";

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
    serviceObject.start().catch((error: unknown) => {
      log.error("Failed to start the service", error);
    });
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
    try {
      await chrome.runtime.sendMessage(broadcast);
    } catch (error: unknown) {
      if (String(error).includes(NO_RECEIVER_ERROR)) return;
      log.error("Failed to broadcast", event, error);
    }
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
        sendResponse(errorResponse(error));
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
            sendResponse(errorResponse(error));
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

function errorResponse(error: unknown): ErrorResponseMessage {
  if (error instanceof ServiceError) {
    const { message, code, params } = error;
    return { type: "response", success: false, error: message, code, params };
  }
  // The page shows the message, so it carries no "Error: " prefix
  const message = error instanceof Error ? error.message : String(error);
  return { type: "response", success: false, error: message };
}
