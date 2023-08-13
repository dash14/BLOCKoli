import { Broadcaster } from "@/modules/services/interfaces/core";
import {
  Message,
  BroadcastMessage,
  RequestMessage,
  ResponseMessage,
} from "./types";

export class MessageServer<T> implements Broadcaster<T> {
  private service: string;
  private isStarted = false;

  constructor(service: string) {
    this.service = service;
  }

  public start(serviceObject: unknown) {
    if (this.isStarted) return;
    this.isStarted = true;
    chrome.runtime.onMessage.addListener(
      this.buildMessageListener(serviceObject)
    );
  }

  private buildMessageListener(serviceObject: unknown) {
    return (
      message: Message,
      sender: chrome.runtime.MessageSender,
      sendResponse: (message: ResponseMessage) => void
    ): boolean => {
      if (message.type !== "request") {
        sendResponse({
          type: "response",
          success: false,
          error: new Error(
            "Malformed message. message: " + JSON.stringify(message)
          ),
        });
        return false;
      }

      if (!this.isStarted) {
        sendResponse({
          type: "response",
          success: false,
          error: new Error("Message server is not started."),
        });
        return false;
      }

      console.log(
        sender.tab
          ? "from a content script:" + sender.tab.url
          : "from the extension"
      );

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
          error: new Error(
            `Not found "${request.method}" in "${request.service}" service.`
          ),
        });
      }

      let result;
      try {
        result = method.call(service, ...request.args);
      } catch (error: unknown) {
        sendResponse({
          type: "response",
          success: false,
          error: error instanceof Error ? error : new Error(String(error)),
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
              error: error instanceof Error ? error : new Error(String(error)),
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

  async broadcast<K extends keyof T & string>(
    event: K,
    message: T[K]
  ): Promise<void> {
    const broadcast: BroadcastMessage = {
      type: "broadcast",
      service: this.service,
      event,
      message,
    };
    await chrome.runtime.sendMessage(broadcast);
  }
}
