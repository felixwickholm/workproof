import { describe, expect, it } from "vitest";
import { answerReady, defaultMode } from "./answer-mode";

const empty = { answer: "", spoken: false, picture: null, caption: "" };

describe("answer mode", () => {
  it("opens each kind of proof in the way it asks for", () => {
    expect(defaultMode("photo")).toBe("picture");
    expect(defaultMode("design")).toBe("picture");
    expect(defaultMode("voice")).toBe("say");
    expect(defaultMode("video")).toBe("write");
    expect(defaultMode("plan")).toBe("write");
  });

  it("needs words, or a picture with a sentence about it", () => {
    expect(answerReady("write", empty)).toBe(false);
    expect(answerReady("write", { ...empty, answer: "  " })).toBe(false);
    expect(answerReady("say", { ...empty, answer: "Keep the insulin visit." })).toBe(true);
    expect(answerReady("picture", { ...empty, picture: "data:image/jpeg;base64,AAAA" })).toBe(false);
    expect(answerReady("picture", { ...empty, picture: "data:image/jpeg;base64,AAAA", caption: "The plate" })).toBe(true);
  });
});
