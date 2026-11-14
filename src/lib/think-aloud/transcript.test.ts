import { describe, expect, it } from "vitest";
import { clock, joinHeard, lastWords, spokenLength, transcriptToSend } from "./transcript";

describe("think-aloud transcript", () => {
  it("joins settled and interim words", () => {
    expect(joinHeard("so the insulin", "visit first")).toBe("so the insulin visit first");
    expect(joinHeard("", "  ")).toBe("");
  });

  it("shows only the last words on the pill", () => {
    expect(lastWords("one two three", 7)).toBe("one two three");
    expect(lastWords("a b c d e f g h i", 3)).toBe("…g h i");
    expect(lastWords("   ")).toBe("");
  });

  it("cleans and clips the text it sends", () => {
    expect(transcriptToSend("  hello   there \n\n second  line ")).toBe("hello there\nsecond line");
    expect(transcriptToSend("x".repeat(7000))).toHaveLength(6000);
  });

  it("writes times for people", () => {
    expect(clock(7)).toBe("0:07");
    expect(clock(245)).toBe("4:05");
    expect(clock(-3)).toBe("0:00");
    expect(spokenLength(45)).toBe("45 s");
    expect(spokenLength(130)).toBe("2 min 10 s");
    expect(spokenLength(120)).toBe("2 min");
  });
});
