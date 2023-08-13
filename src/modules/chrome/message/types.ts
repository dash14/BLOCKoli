import { EventDispatchable } from "@/modules/services/interfaces/core";

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
  error: Error;
}

export type ResponseMessage = SuccessResponseMessage | ErrorResponseMessage;

export interface BroadcastMessage extends Message {
  type: "broadcast";
  service: string;
  event: string;
  message: unknown;
}

export type MessageProxy<T, E> = T & EventDispatchable<E>;
