import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { EventEmitter, Events } from "@/modules/core/service";
import { ServiceBase } from "@/modules/core/service";
import { MessageProxyFactory } from "./MessageProxy";

// Mock logging
vi.mock("@/modules/utils/logging", () => ({
  default: {
    getLogger: () => ({
      debug: vi.fn(),
    }),
  },
}));

interface TestEvents extends Events {
  onUpdate: { id: number; name: string };
  onDelete: { id: number };
}

class TestService extends ServiceBase<TestEvents> {
  constructor(emitter: EventEmitter<TestEvents>) {
    super(emitter);
  }
  async start(): Promise<void> {}
  async getData(): Promise<string> {
    return "data";
  }
  async setData(value: string): Promise<void> {
    // Mock implementation
    void value;
  }
}

describe("MessageProxyFactory", () => {
  let mockAddListener: ReturnType<typeof vi.fn>;
  let mockRemoveListener: ReturnType<typeof vi.fn>;
  let mockSendMessage: ReturnType<typeof vi.fn>;
  let messageListeners: ((
    message: unknown,
    sender: unknown,
    sendResponse: (response: unknown) => void
  ) => void)[];

  beforeEach(() => {
    messageListeners = [];

    mockAddListener = vi.fn((listener) => {
      messageListeners.push(listener);
    });

    mockRemoveListener = vi.fn((listener) => {
      const index = messageListeners.indexOf(listener);
      if (index > -1) {
        messageListeners.splice(index, 1);
      }
    });

    mockSendMessage = vi.fn();

    vi.stubGlobal("chrome", {
      runtime: {
        onMessage: {
          addListener: mockAddListener,
          removeListener: mockRemoveListener,
        },
        sendMessage: mockSendMessage,
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("create", () => {
    it("creates a MessageProxy instance", () => {
      const factory = new MessageProxyFactory();
      const proxy = factory.create<TestService>("testService");

      expect(proxy).toBeDefined();
    });

    it("proxy has addEventListener method", () => {
      const factory = new MessageProxyFactory();
      const proxy = factory.create<TestService>("testService");

      expect(typeof proxy.addEventListener).toBe("function");
    });

    it("proxy has removeAllEventListeners method", () => {
      const factory = new MessageProxyFactory();
      const proxy = factory.create<TestService>("testService");

      expect(typeof proxy.removeAllEventListeners).toBe("function");
    });
  });

  describe("method calls through proxy", () => {
    it("sends request message when calling proxy method", async () => {
      mockSendMessage.mockResolvedValue({
        type: "response",
        success: true,
        result: "test result",
      });

      const factory = new MessageProxyFactory();
      const proxy = factory.create<TestService>("testService");

      const result = await proxy.getData();

      expect(mockSendMessage).toHaveBeenCalledWith({
        type: "request",
        service: "testService",
        method: "getData",
        args: [],
      });
      expect(result).toBe("test result");
    });

    it("passes arguments to request message", async () => {
      mockSendMessage.mockResolvedValue({
        type: "response",
        success: true,
        result: undefined,
      });

      const factory = new MessageProxyFactory();
      const proxy = factory.create<TestService>("testService");

      await proxy.setData("test value");

      expect(mockSendMessage).toHaveBeenCalledWith({
        type: "request",
        service: "testService",
        method: "setData",
        args: ["test value"],
      });
    });

    it("throws error when no response from service worker", async () => {
      mockSendMessage.mockResolvedValue(undefined);

      const factory = new MessageProxyFactory();
      const proxy = factory.create<TestService>("testService");

      await expect(proxy.getData()).rejects.toThrow(
        "No response from service worker"
      );
    });

    it("throws error when response type is not response", async () => {
      mockSendMessage.mockResolvedValue({
        type: "broadcast",
      });

      const factory = new MessageProxyFactory();
      const proxy = factory.create<TestService>("testService");

      await expect(proxy.getData()).rejects.toThrow("Malformed message");
    });

    it("throws error from response when success is false", async () => {
      mockSendMessage.mockResolvedValue({
        type: "response",
        success: false,
        error: "Test error message",
      });

      const factory = new MessageProxyFactory();
      const proxy = factory.create<TestService>("testService");

      await expect(proxy.getData()).rejects.toBe("Test error message");
    });
  });

  describe("event listeners", () => {
    it("registers chrome.runtime.onMessage listener when addEventListener is called", () => {
      const factory = new MessageProxyFactory();
      const proxy = factory.create<TestService>("testService");

      proxy.addEventListener("onUpdate", () => {});

      expect(mockAddListener).toHaveBeenCalledTimes(1);
    });

    it("only registers one chrome listener for multiple event listeners", () => {
      const factory = new MessageProxyFactory();
      const proxy = factory.create<TestService>("testService");

      proxy.addEventListener("onUpdate", () => {});
      proxy.addEventListener("onDelete", () => {});
      proxy.addEventListener("onUpdate", () => {});

      expect(mockAddListener).toHaveBeenCalledTimes(1);
    });

    it("dispatches event to registered handler", () => {
      const factory = new MessageProxyFactory();
      const proxy = factory.create<TestService>("testService");

      const handler = vi.fn();
      proxy.addEventListener("onUpdate", handler);

      // Simulate receiving a broadcast message
      const sendResponse = vi.fn();
      messageListeners[0](
        {
          type: "broadcast",
          service: "testService",
          event: "onUpdate",
          message: { id: 1, name: "test" },
        },
        {},
        sendResponse
      );

      expect(handler).toHaveBeenCalledWith({ id: 1, name: "test" });
      expect(sendResponse).toHaveBeenCalledWith(true);
    });

    it("does not dispatch event for different service", () => {
      const factory = new MessageProxyFactory();
      const proxy = factory.create<TestService>("testService");

      const handler = vi.fn();
      proxy.addEventListener("onUpdate", handler);

      // Simulate receiving a broadcast message for different service
      const sendResponse = vi.fn();
      messageListeners[0](
        {
          type: "broadcast",
          service: "otherService",
          event: "onUpdate",
          message: { id: 1, name: "test" },
        },
        {},
        sendResponse
      );

      expect(handler).not.toHaveBeenCalled();
      expect(sendResponse).not.toHaveBeenCalled();
    });

    it("does not dispatch event for non-broadcast message", () => {
      const factory = new MessageProxyFactory();
      const proxy = factory.create<TestService>("testService");

      const handler = vi.fn();
      proxy.addEventListener("onUpdate", handler);

      // Simulate receiving a request message
      const sendResponse = vi.fn();
      messageListeners[0](
        {
          type: "request",
          service: "testService",
          method: "getData",
          args: [],
        },
        {},
        sendResponse
      );

      expect(handler).not.toHaveBeenCalled();
    });

    it("dispatches to multiple handlers for same event", () => {
      const factory = new MessageProxyFactory();
      const proxy = factory.create<TestService>("testService");

      const handler1 = vi.fn();
      const handler2 = vi.fn();
      proxy.addEventListener("onUpdate", handler1);
      proxy.addEventListener("onUpdate", handler2);

      // Simulate receiving a broadcast message
      const sendResponse = vi.fn();
      messageListeners[0](
        {
          type: "broadcast",
          service: "testService",
          event: "onUpdate",
          message: { id: 1, name: "test" },
        },
        {},
        sendResponse
      );

      expect(handler1).toHaveBeenCalledWith({ id: 1, name: "test" });
      expect(handler2).toHaveBeenCalledWith({ id: 1, name: "test" });
    });

    it("removeAllEventListeners removes chrome listener", () => {
      const factory = new MessageProxyFactory();
      const proxy = factory.create<TestService>("testService");

      proxy.addEventListener("onUpdate", () => {});
      proxy.removeAllEventListeners();

      expect(mockRemoveListener).toHaveBeenCalledTimes(1);
    });

    it("removeAllEventListeners clears all handlers", () => {
      const factory = new MessageProxyFactory();
      const proxy = factory.create<TestService>("testService");

      const handler = vi.fn();
      proxy.addEventListener("onUpdate", handler);
      proxy.removeAllEventListeners();

      // Re-add listener to set up new chrome listener
      proxy.addEventListener("onUpdate", vi.fn());

      // Simulate receiving a broadcast message - use last listener in array
      const sendResponse = vi.fn();
      const lastListener = messageListeners[messageListeners.length - 1];
      lastListener(
        {
          type: "broadcast",
          service: "testService",
          event: "onUpdate",
          message: { id: 1, name: "test" },
        },
        {},
        sendResponse
      );

      // Original handler should not be called
      expect(handler).not.toHaveBeenCalled();
    });

    it("can add event listener after removeAllEventListeners", () => {
      const factory = new MessageProxyFactory();
      const proxy = factory.create<TestService>("testService");

      proxy.addEventListener("onUpdate", () => {});
      proxy.removeAllEventListeners();

      const handler = vi.fn();
      proxy.addEventListener("onUpdate", handler);

      // Simulate receiving a broadcast message - use last listener in array
      const sendResponse = vi.fn();
      const lastListener = messageListeners[messageListeners.length - 1];
      lastListener(
        {
          type: "broadcast",
          service: "testService",
          event: "onUpdate",
          message: { id: 1, name: "test" },
        },
        {},
        sendResponse
      );

      expect(handler).toHaveBeenCalledWith({ id: 1, name: "test" });
    });
  });
});
