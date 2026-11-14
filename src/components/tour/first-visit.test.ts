import { describe, expect, it } from "vitest";
import { isOffParam, markStorySeen, seenKey, shouldAutoStart, STORY_SEEN_KEY, storySeen, takePulse, type KeyStore } from "./first-visit";

/** A Web Storage stand-in. */
function store(): KeyStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (key) => data.get(key) ?? null, setItem: (key, value) => void data.set(key, value) };
}

const blocked: KeyStore = {
  getItem: () => {
    throw new Error("blocked");
  },
  setItem: () => {
    throw new Error("blocked");
  },
};

const firstVisit = { path: "/", param: null, seen: false, automated: false };

describe("the story starts by itself", () => {
  it("on a first visit that opens on Mikko's home", () => {
    expect(shouldAutoStart(firstVisit)).toBe(true);
    expect(shouldAutoStart({ ...firstVisit, path: "/seeker" })).toBe(true);
  });

  it("never once the visitor closed or finished it", () => {
    expect(shouldAutoStart({ ...firstVisit, seen: true })).toBe(false);
  });

  it("never on another page, so a shared link opens what it names", () => {
    for (const path of ["/company", "/city", "/for-judges", "/how-it-works", "/my-work/x"]) expect(shouldAutoStart({ ...firstVisit, path })).toBe(false);
  });

  it("never when a link says what to do, or for a test browser or crawler", () => {
    expect(shouldAutoStart({ ...firstVisit, param: "1" })).toBe(false);
    expect(shouldAutoStart({ ...firstVisit, param: "0" })).toBe(false);
    expect(shouldAutoStart({ ...firstVisit, automated: true })).toBe(false);
  });

  it("reads ?tour=0 and ?tour=off as off", () => {
    expect(isOffParam("0")).toBe(true);
    expect(isOffParam("off")).toBe(true);
    expect(isOffParam("1")).toBe(false);
    expect(isOffParam(null)).toBe(false);
  });

  it("remembers a close, and never throws when storage is blocked or missing", () => {
    const local = store();
    expect(storySeen(local)).toBe(false);
    markStorySeen(local);
    expect(local.data.get(STORY_SEEN_KEY)).toBe("1");
    expect(storySeen(local)).toBe(true);
    expect(storySeen(blocked)).toBe(false);
    expect(() => markStorySeen(blocked)).not.toThrow();
    expect(storySeen(undefined)).toBe(false);
  });
});

describe("the Show me pulse", () => {
  it("pulses the first time a view opens in this browser, then never again by itself", () => {
    const local = store();
    expect(takePulse("seeker", local)).toBe(true);
    expect(local.data.get(seenKey("seeker"))).toBe("1");
    expect(takePulse("seeker", local)).toBe(false);
    expect(takePulse("city", local)).toBe(true);
  });

  it("stays still and never throws when storage is blocked or missing", () => {
    expect(takePulse("city", blocked)).toBe(false);
    expect(takePulse("city", undefined)).toBe(false);
  });
});
