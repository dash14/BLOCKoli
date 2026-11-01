import { afterEach, describe, expect, it, vi } from "vitest";

const { loglevel, prefixer } = vi.hoisted(() => {
  const instance = { name: "instance" };
  return {
    loglevel: {
      levels: { DEBUG: 1, WARN: 3 },
      setDefaultLevel: vi.fn(),
      noConflict: vi.fn(() => instance),
      instance,
    },
    prefixer: { reg: vi.fn(), apply: vi.fn() },
  };
});
vi.mock("loglevel", () => ({ default: loglevel }));
vi.mock("loglevel-plugin-prefix", () => ({ default: prefixer }));

async function load(mode: string) {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv("MODE", mode);
  return (await import("./logging")).default;
}

describe("logging", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("logs debug messages in development", async () => {
    await load("development");

    expect(loglevel.setDefaultLevel).toHaveBeenCalledWith(
      loglevel.levels.DEBUG
    );
  });

  it("logs only warnings and errors otherwise", async () => {
    await load("production");

    expect(loglevel.setDefaultLevel).toHaveBeenCalledWith(
      loglevel.levels.WARN
    );
  });

  it("prefixes messages with time, level and logger name", async () => {
    const logging = await load("production");

    expect(logging).toBe(loglevel);
    expect(prefixer.reg).toHaveBeenCalledWith(loglevel.instance);
    expect(prefixer.apply).toHaveBeenCalledWith(loglevel.instance, {
      template: "[%t] %l: [%n]",
    });
  });
});
