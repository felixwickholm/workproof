import { describe, expect, it } from "vitest";
import { levelFromSamples } from "./level";

describe("levelFromSamples", () => {
  it("is zero for silence and for no samples", () => {
    expect(levelFromSamples(new Uint8Array(64).fill(128))).toBe(0);
    expect(levelFromSamples(new Uint8Array())).toBe(0);
  });

  it("rises with loudness and stops at one", () => {
    const quiet = levelFromSamples(Uint8Array.from({ length: 64 }, (_, i) => (i % 2 ? 133 : 123)));
    const loud = levelFromSamples(Uint8Array.from({ length: 64 }, (_, i) => (i % 2 ? 160 : 96)));
    const clipped = levelFromSamples(Uint8Array.from({ length: 64 }, (_, i) => (i % 2 ? 255 : 0)));
    expect(quiet).toBeGreaterThan(0);
    expect(loud).toBeGreaterThan(quiet);
    expect(clipped).toBe(1);
  });
});
