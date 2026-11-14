import { describe, expect, it } from "vitest";
import { createWindowLimiter, creationKey } from "./creation-limit";

const headers = (values: Record<string, string>) => new Headers(values);

describe("sandbox creation limit", () => {
  it("allows 20 new sandboxes per address in 10 minutes, then refuses until the window ends", () => {
    const limiter = createWindowLimiter({ max: 20, windowMs: 600_000 });
    for (let i = 0; i < 20; i++) expect(limiter.allow("198.51.100.7", 0)).toBe(true);
    expect(limiter.allow("198.51.100.7", 1000)).toBe(false);
    expect(limiter.allow("198.51.100.8", 1000)).toBe(true);
    expect(limiter.allow("198.51.100.7", 600_000)).toBe(true);
  });

  it("never limits an undefined key", () => {
    const limiter = createWindowLimiter({ max: 1, windowMs: 600_000 });
    for (let i = 0; i < 5; i++) expect(limiter.allow(undefined, 0)).toBe(true);
  });

  it("counts by the first forwarded address, then x-real-ip", () => {
    expect(creationKey(headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" }), true)).toBe("203.0.113.5");
    expect(creationKey(headers({ "x-real-ip": "203.0.113.6" }), true)).toBe("203.0.113.6");
  });

  it("puts callers without an address under one shared key", () => {
    expect(creationKey(headers({}), true)).toBe("unknown");
    expect(creationKey(headers({}), false)).toBe("unknown");
  });

  it("exempts loopback only outside production", () => {
    expect(creationKey(headers({ "x-forwarded-for": "::1" }), false)).toBeUndefined();
    expect(creationKey(headers({ "x-forwarded-for": "127.0.0.1" }), false)).toBeUndefined();
    expect(creationKey(headers({ "x-forwarded-for": "127.0.0.1" }), true)).toBe("127.0.0.1");
  });
});
