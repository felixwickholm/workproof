import { describe, expect, it } from "vitest";
import { checkFeedback, countSentences } from "./feedback-check";

describe("countSentences", () => {
  it("counts sentences of two words or more", () => {
    expect(countSentences("You saw the blood thinner risk. I want to hear how you would brief the evening shift.")).toBe(2);
    expect(countSentences("Clear plan! Why did you call the daughter first?")).toBe(2);
  });

  it("ignores single words and stray marks", () => {
    expect(countSentences("Ok. Good. ...")).toBe(0);
    expect(countSentences("")).toBe(0);
  });

  it("counts a last sentence without a full stop", () => {
    expect(countSentences("The plan keeps the insulin visit. The shower can wait")).toBe(2);
  });
});

describe("checkFeedback", () => {
  const two = "You saw the blood thinner risk. I want to hear how you would brief the evening shift.";

  it("is ready with a name and two real sentences", () => {
    expect(checkFeedback("Anna Koivisto", two).waitingFor).toBeNull();
  });

  it("asks for the answer before anything else", () => {
    expect(checkFeedback("Anna Koivisto", "  ").waitingFor).toBe("Write your answer to the person first.");
  });

  it("asks for the missing sentence", () => {
    expect(checkFeedback("Anna Koivisto", "You saw the blood thinner risk.").waitingFor).toBe("Write 1 more sentence.");
  });

  it("keeps the shared rule for the reviewer's name", () => {
    expect(checkFeedback("", two).waitingFor).toBe("Add the name of the person who decided.");
  });

  it("reports the live counts", () => {
    const check = checkFeedback("Anna", two);
    expect(check.sentences).toBe(2);
    expect(check.characters).toBe(two.length);
  });
});
