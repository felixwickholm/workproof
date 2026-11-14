import { describe, expect, it } from "vitest";
import { DEMO_REBUILDS_PER_MINUTE, POSTS_PER_MINUTE } from "./limits";
import { limitDemoRebuilds, limitRate, readLimitedText } from "./request-guard";

const from = (address: string, body?: string) =>
  new Request("http://localhost/api", { method: "POST", headers: { "x-forwarded-for": address }, body });

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

  it("caps the body at the route's own limit", async () => {
    await expect(readLimitedText(from("127.0.0.1", "x".repeat(20)), 10)).rejects.toThrow(/too large/);
    await expect(readLimitedText(from("127.0.0.1", "x".repeat(10)), 10)).resolves.toBe("x".repeat(10));
  });
});
