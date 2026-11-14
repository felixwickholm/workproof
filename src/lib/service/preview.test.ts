import { describe, expect, it } from "vitest";
import { blindWork } from "@/lib/blind/blind-work";
import { blindPreview } from "./preview";

const input = {
  answer: "I would call the family first. I learned this at Kaari Home Care. Reach me at leila@example.org.\n\nLeila Haddad",
  explain: [{ question: "Why call first?", answer: "Leila always calls first because a message can wait unread." }],
  name: "Leila Haddad",
  contact: "leila@example.org",
};

describe("blindPreview", () => {
  it("hides the author's name, contact and event companies before anything is sent", () => {
    const preview = blindPreview(input, ["Kaari Home Care"]);
    expect(preview.work).not.toMatch(/Leila|Haddad|example\.org|Kaari/);
    expect(preview.explain[0].answer).not.toMatch(/Leila/);
    expect(preview.work).toContain("call the family first");
    expect(preview.hiddenCount).toBeGreaterThanOrEqual(4);
  });

  it("shows exactly the text that sending produces", () => {
    const sent = blindWork(input.answer, input.explain, { name: input.name, contact: input.contact, companies: ["Kaari Home Care"] });
    const preview = blindPreview(input, ["Kaari Home Care"]);
    expect(preview.work).toBe(sent.work);
    expect(preview.explain).toEqual(sent.explain);
  });

  it("counts nothing when nothing identifies the author", () => {
    expect(blindPreview({ answer: "Retry 3 times with backoff.", explain: [], name: "", contact: "" }, []).hiddenCount).toBe(0);
  });
});
