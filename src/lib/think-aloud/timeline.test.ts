import { describe, expect, it } from "vitest";
import { DEMO_MS, firstWords, frameAt, wordCount, type DemoScript } from "./timeline";

const choose: DemoScript = { format: "choose", transcript: "one two three four five six seven eight nine ten", answer: "B is better.", choice: "b", seconds: 600 };

describe("demo timeline", () => {
  it("starts empty and ends complete", () => {
    const start = frameAt(choose, 0);
    expect(start).toMatchObject({ progress: 0, clock: 0, words: 0, typed: 0, picked: null, done: false });
    const end = frameAt(choose, DEMO_MS);
    expect(end).toMatchObject({ progress: 1, clock: 600, words: 10, typed: choose.answer.length, picked: "b", done: true });
  });

  it("never goes backwards", () => {
    let last = frameAt(choose, 0);
    for (let ms = 0; ms <= DEMO_MS; ms += 250) {
      const f = frameAt(choose, ms);
      expect(f.words).toBeGreaterThanOrEqual(last.words);
      expect(f.typed).toBeGreaterThanOrEqual(last.typed);
      expect(f.clock).toBeGreaterThanOrEqual(last.clock);
      last = f;
    }
  });

  it("points at the option, then the editor, then Stop", () => {
    const targets = new Set<string>();
    for (let ms = 0; ms <= DEMO_MS; ms += 100) targets.add(frameAt(choose, ms).cursor);
    expect([...targets]).toEqual(["rest", "option-b", "editor", "stop"]);
  });

  it("marks a unit in a Fix session and picks nothing", () => {
    const f = frameAt({ format: "fix", transcript: "a b", answer: "x", mark: 4, seconds: 60 }, DEMO_MS / 2);
    expect(f.marked).toBe(4);
    expect(f.picked).toBeNull();
  });

  it("counts and cuts words", () => {
    expect(wordCount("  a  b c ")).toBe(3);
    expect(firstWords("a b c d", 2)).toBe("a b");
    expect(firstWords("a b", 0)).toBe("");
  });
});
