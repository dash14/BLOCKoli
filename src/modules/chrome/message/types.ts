import { EventDispatchable, Events, ServiceBase } from "@/modules/core/service";

export interface Message {
  type: "request" | "response" | "broadcast";
}

export interface RequestMessage extends Message {
  type: "request";
  service: string;
  method: string;
  args: unknown[];
}

interface SuccessResponseMessage extends Message {
  type: "response";
  success: true;
  result: unknown;
}

interface ErrorResponseMessage extends Message {
  type: "response";
  success: false;
  error: string;
}

export type ResponseMessage = SuccessResponseMessage | ErrorResponseMessage;

export interface BroadcastMessage<T extends Events> extends Message {
  type: "broadcast";
  service: string;
  event: keyof T;
  message: T[keyof T];
}

export type MessageProxy<T> = T extends ServiceBase<infer E>
  ? T & EventDispatchable<E>
  : never;
