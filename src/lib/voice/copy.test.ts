import { describe, expect, it } from "vitest";
import { demoLevel, formatClock, privacyLine, words } from "./copy";

describe("privacyLine", () => {
  it("promises the voice stays local only when it really does", () => {
    expect(privacyLine("on-device")).toBe("Only the text is kept. Your voice stays on this device.");
    expect(privacyLine("browser-service")).not.toMatch(/stays on this device/);
    expect(privacyLine("server-once")).toMatch(/sent once/);
    expect(privacyLine("typed")).toBe("Only the text is kept.");
  });
});

describe("formatClock", () => {
  it("shows minutes and two-digit seconds", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(7.9)).toBe("0:07");
    expect(formatClock(60)).toBe("1:00");
    expect(formatClock(-3)).toBe("0:00");
  });
});

describe("words", () => {
  it("splits on any whitespace and drops empty parts", () => {
    expect(words("  I chose\nthe  short route ")).toEqual(["I", "chose", "the", "short", "route"]);
    expect(words("")).toEqual([]);
  });
});

describe("demoLevel", () => {
  it("stays between 0 and 1 and keeps moving", () => {
    const samples = Array.from({ length: 200 }, (_, i) => demoLevel(i * 16));
    expect(Math.min(...samples)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...samples)).toBeLessThanOrEqual(1);
    expect(new Set(samples.map((value) => value.toFixed(2))).size).toBeGreaterThan(10);
  });
});
