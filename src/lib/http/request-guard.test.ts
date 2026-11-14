import { describe, expect, it } from "vitest";
import { DEMO_REBUILDS_PER_MINUTE, POSTS_PER_MINUTE } from "./limits";
import { limitDemoRebuilds, limitRate, readLimitedText } from "./request-guard";

const from = (address: string, body?: string) =>
  new Request("http://localhost/api", { method: "POST", headers: { "x-forwarded-for": address }, body });

const SANDBOX_A = "sb_0f6c2a1e-6d1b-4f6a-9b7e-2c4d8e1a3b5c";
const SANDBOX_B = "sb_7a9d3c2b-1e4f-4a8b-8c6d-5e2f1a0b9c8d";

/** A request with the sandbox cookie and, when given, the address a proxy reports. */
const inSandbox = (sandbox: string, address?: string) =>
  new Request("http://localhost/api", {
    method: "POST",
    headers: { cookie: `theme=dark; workprint_sandbox=${sandbox}`, ...(address ? { "x-forwarded-for": address } : {}) },
  });

describe("request guard", () => {
  it("counts story and reset requests apart from other changes", () => {
    const now = 1_000_000;
    for (let i = 0; i < POSTS_PER_MINUTE; i++) limitRate(from("198.51.100.7"), now);
    expect(() => limitRate(from("198.51.100.7"), now)).toThrow(/Too many/);
    expect(() => limitDemoRebuilds(from("198.51.100.7"), now)).not.toThrow();
  });

  it("limits story and reset requests on their own count", () => {
    const now = 2_000_000;
    for (let i = 0; i < DEMO_REBUILDS_PER_MINUTE; i++) limitDemoRebuilds(from("198.51.100.8"), now);
    expect(() => limitDemoRebuilds(from("198.51.100.8"), now)).toThrow(/Too many/);
    expect(() => limitDemoRebuilds(from("198.51.100.8"), now + 60_000)).not.toThrow();
  });

  it("limits each sandbox on its own, even when the proxy hides the address", () => {
    const now = 3_000_000;
    for (let i = 0; i < POSTS_PER_MINUTE; i++) limitRate(inSandbox(SANDBOX_A), now);
    expect(() => limitRate(inSandbox(SANDBOX_A), now)).toThrow(/Too many/);
    expect(() => limitRate(inSandbox(SANDBOX_A, "127.0.0.1"), now)).toThrow(/Too many/);
    expect(() => limitRate(inSandbox(SANDBOX_B), now)).not.toThrow();
    expect(() => limitRate(inSandbox(SANDBOX_A), now + 60_000)).not.toThrow();
  });

  it("counts many sandboxes behind one address under that address too", () => {
    const now = 4_000_000;
    for (let i = 0; i < POSTS_PER_MINUTE; i++) limitRate(inSandbox(i % 2 ? SANDBOX_A : SANDBOX_B, "198.51.100.9"), now);
    expect(() => limitRate(inSandbox(SANDBOX_A, "198.51.100.9"), now)).toThrow(/Too many/);
  });

  it("leaves local callers without a sandbox, and a cookie that is not a sandbox id, unlimited", () => {
    const now = 5_000_000;
    const local = () => new Request("http://localhost/api", { method: "POST" });
    const forged = () => new Request("http://localhost/api", { method: "POST", headers: { cookie: "workprint_sandbox=short" } });
    for (let i = 0; i < POSTS_PER_MINUTE * 2; i++) {
      limitRate(local(), now);
      limitRate(forged(), now);
    }
    expect(() => limitRate(local(), now)).not.toThrow();
    expect(() => limitRate(forged(), now)).not.toThrow();
  });

  it("caps the body at the route's own limit", async () => {
    await expect(readLimitedText(from("127.0.0.1", "x".repeat(20)), 10)).rejects.toThrow(/too large/);
    await expect(readLimitedText(from("127.0.0.1", "x".repeat(10)), 10)).resolves.toBe("x".repeat(10));
  });
});
