import { describe, expect, it } from "vitest";
import { offerDemo, OFFER_KEY, seenKey, takePulse, type KeyStore } from "./demo-offer";

/** A Web Storage stand-in. */
function store(): KeyStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

const blocked: KeyStore = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  },
  removeItem: () => {
    throw new Error("blocked");
  },
};

describe("the Show me pulse", () => {
  it("pulses the first time a view opens in this browser, then never again by itself", () => {
    const local = store();
    expect(takePulse("seeker", local, store())).toBe(true);
    expect(local.data.get(seenKey("seeker"))).toBe("1");
    expect(takePulse("seeker", local, store())).toBe(false);
    expect(takePulse("city", local, store())).toBe(true);
  });

  it("pulses once more when the overview's end card sent the visitor to that view", () => {
    const local = store();
    const session = store();
    takePulse("employer", local, session);
    offerDemo("employer", session);
    expect(session.data.get(OFFER_KEY)).toBe("employer");
    expect(takePulse("seeker", local, session)).toBe(true);
    expect(takePulse("employer", local, session)).toBe(true);
    expect(session.data.has(OFFER_KEY)).toBe(false);
    expect(takePulse("employer", local, session)).toBe(false);
  });

  it("stays still and never throws when storage is blocked or missing", () => {
    expect(takePulse("city", blocked, blocked)).toBe(false);
    expect(takePulse("city", undefined, undefined)).toBe(false);
    expect(() => offerDemo("city", blocked)).not.toThrow();
  });
});
