import { EventDispatchable } from "@/modules/services/interfaces/core";

export interface Message {
  type: "request" | "response" | "broadcast";
}

export interface MessageRequest extends Message {
  type: "request";
  service: string;
  method: string;
  args: unknown[];
}

interface MessageSuccessResponse extends Message {
  type: "response";
  success: true;
  result: unknown;
}

interface MessageErrorResponse extends Message {
  type: "response";
  success: false;
  error: Error;
}

export type MessageResponse = MessageSuccessResponse | MessageErrorResponse;

export interface MessageBroadcast extends Message {
  type: "broadcast";
  service: string;
  event: string;
  message: unknown;
}

export type MessageProxy<T, E> = T & EventDispatchable<E>;
