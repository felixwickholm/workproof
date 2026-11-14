import { describe, expect, it } from "vitest";
import type { Challenge } from "@/lib/domain/types";
import { draftFromNeed } from "./compose";
import { followUpQuestions, quoteFrom, WHOLE_SENTENCE_CHARS } from "./follow-ups";

const challenge: Challenge = { ...draftFromNeed("Embedded engineer: firmware, safety"), id: "ch-test", companyIds: [], approvedBy: "Anna Koivisto", createdAt: "" };

describe("quoteFrom", () => {
  it("quotes a short sentence whole, never cut mid-thought", () => {
    const answer = "The while loop has no timeout so if the sensor hangs the motor is never cut. A watchdog would reset it.";
    const quote = quoteFrom(challenge, answer);
    expect(quote).toBe("The while loop has no timeout so if the sensor hangs the motor is never cut");
    expect(quote).not.toContain("…");
  });

  it("cuts a long sentence at word boundaries and says so with an ellipsis", () => {
    const sentence =
      "First I would read the whole driver from the top and then I would look at the while loop that waits for the sensor without any timeout at all, because a stuck sensor would keep the motor running.";
    expect(sentence.length).toBeGreaterThan(WHOLE_SENTENCE_CHARS);
    const quote = quoteFrom(challenge, sentence) ?? "";
    expect(quote.endsWith("…")).toBe(true);
    const words = quote.replace(/…/g, "").split(" ");
    for (const word of words) expect(sentence.split(/\s+/).map((w) => w.replace(/[^\p{L}\p{N}')]+$/u, ""))).toContain(word);
  });

  it("keeps the person's quote marks from breaking the question", () => {
    expect(quoteFrom(challenge, 'I would add a "timeout" to the loop that waits for the sensor.')).toBe("I would add a 'timeout' to the loop that waits for the sensor");
  });

  it("quotes nothing from an answer of only hidden details", () => {
    expect(quoteFrom(challenge, "[hidden] [hidden] [hidden]")).toBeUndefined();
  });
});

describe("followUpQuestions", () => {
  it("asks two questions on an event task, the first about the person's own words", () => {
    const answer = "The while loop has no timeout so if the sensor hangs the motor is never cut. A watchdog would reset it.";
    const [why, change] = followUpQuestions(challenge, answer);
    expect(why).toContain('"The while loop has no timeout so if the sensor hangs the motor is never cut"');
    expect(change).toMatch(/^If .+, what would you change in your answer\?$/);
  });

  it("asks for the reasoning behind a short answer", () => {
    expect(followUpQuestions(challenge, "Add a timeout.")[0]).toMatch(/^Your answer is short/);
  });
});
