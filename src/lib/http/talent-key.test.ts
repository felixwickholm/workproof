import { describe, expect, it } from "vitest";
import { ServiceError } from "@/lib/service/support";
import { talentKey } from "./talent-key";

const withKey = (key?: string) => new Request("http://localhost/api/passport/me", { headers: key === undefined ? {} : { "x-workproof-key": key } });

describe("talentKey", () => {
  it("reads the private key from the header", () => {
    expect(talentKey(withKey("  t_abc123 "))).toBe("t_abc123");
  });

  it.each([undefined, "", "   ", "k".repeat(101)])("refuses a missing or oversized key (%s) without repeating it", (key) => {
    try {
      talentKey(withKey(key));
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ServiceError);
      expect((error as ServiceError).status).toBe(401);
      if (key) expect((error as ServiceError).message).not.toContain(key.trim() || "\u0000");
    }
  });
});
