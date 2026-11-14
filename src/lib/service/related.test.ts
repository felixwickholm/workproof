import { describe, expect, it } from "vitest";
import { collectText, findJudgement } from "@/lib/guard/no-judgement";
import { relatedParts } from "./related";

const challenge = {
  coreSkills: [
    { id: "error-handling", label: "Error handling", why: "" },
    { id: "testing", label: "Testing", why: "" },
    { id: "api-design", label: "API design", why: "" },
  ],
};

describe("related parts", () => {
  const proof = {
    work: "First I would add retries with a limit, because the provider times out. Then a test for a double charge. This is excellent work, 10 out of 10. The endpoint should return a clear error.",
    thinkAloud: { transcript: "I am thinking about the failures at the edges here. I would write test cases before I change anything.", seconds: 40 },
  };
  const parts = relatedParts(proof, challenge);

  it("finds the person's own sentences for each skill, by its words, in the order they wrote them", () => {
    expect(parts.map((p) => p.skillId)).toEqual(["error-handling", "testing", "api-design"]);
    expect(parts[0].quotes).toEqual(["First I would add retries with a limit, because the provider times out.", "I am thinking about the failures at the edges here."]);
    expect(parts[1].quotes).toContain("I would write test cases before I change anything.");
    expect(parts[2].quotes).toEqual(["The endpoint should return a clear error."]);
  });

  it("never outputs a number or a judging word, so nothing reads as a score", () => {
    const text = collectText(parts).join("\n");
    expect(text).not.toMatch(/\p{N}/u);
    expect(findJudgement(text)).toEqual([]);
  });

  it("keeps at most three sentences per skill and gives an empty list when a skill does not show up", () => {
    const many = { work: Array.from({ length: 6 }, () => "We add test cases here.").join(" ") + " Nothing else." };
    const found = relatedParts(many, challenge);
    expect(found[1].quotes).toHaveLength(3);
    expect(found[2].quotes).toEqual([]);
  });
});
