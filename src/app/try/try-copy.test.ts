import { describe, expect, it } from "vitest";
import { markHidden } from "@/components/proof";
import {
  cleanSpokenJob,
  clipForDisplay,
  compareTexts,
  inSentence,
  keyboardInset,
  matchSuggestion,
  nameLine,
  practiceLine,
  stepWords,
  SUGGESTIONS,
  withArticle,
} from "./try-copy";

describe("matchSuggestion", () => {
  it("finds a chip whatever the case and spacing", () => {
    expect(matchSuggestion("doctor")).toBe("Doctor");
    expect(matchSuggestion("  software   ENGINEER ")).toBe("Software engineer");
  });

  it("finds nothing for a job that is not a chip", () => {
    expect(matchSuggestion("beekeeper")).toBeNull();
    expect(matchSuggestion("")).toBeNull();
  });

  it("offers eight jobs", () => {
    expect(SUGGESTIONS).toHaveLength(8);
  });
});

describe("withArticle", () => {
  it("puts the job inside a sentence", () => {
    expect(withArticle("Chef")).toBe("a chef");
    expect(withArticle("Electrician")).toBe("an electrician");
    expect(withArticle("beekeeper")).toBe("a beekeeper");
    expect(withArticle("Football coach")).toBe("a football coach");
  });

  it("keeps short forms and says them right", () => {
    expect(withArticle("AI engineer")).toBe("an AI engineer");
    expect(withArticle("UX designer")).toBe("a UX designer");
    expect(withArticle("ML engineer")).toBe("an ML engineer");
  });

  it("lowers only a plain word", () => {
    expect(inSentence(" Beekeeper ")).toBe("beekeeper");
    expect(inSentence("AI engineer")).toBe("AI engineer");
  });

  it("returns nothing for an empty job", () => {
    expect(withArticle("   ")).toBe("");
  });
});

describe("cleanSpokenJob", () => {
  it("drops the full stop a transcript adds", () => {
    expect(cleanSpokenJob(" Chef. ")).toBe("Chef");
    expect(cleanSpokenJob("Game developer")).toBe("Game developer");
  });
});

describe("keyboardInset", () => {
  it("is the part of the screen the keyboard covers", () => {
    expect(keyboardInset(844, 508, 0)).toBe(336);
  });

  it("is zero without a keyboard, and never negative", () => {
    expect(keyboardInset(844, 844, 0)).toBe(0);
    expect(keyboardInset(844, 900, 0)).toBe(0);
  });
});

describe("compareTexts", () => {
  it("lines up hidden details across the answer and the follow-up", () => {
    const { original, blind } = compareTexts(
      { answer: "I am Aino. I would ask first.", explain: "In Turku we did it this way." },
      { work: "I am [hidden]. I would ask first.", explain: [{ question: "Why?", answer: "In [hidden] we did it this way." }] },
    );
    const hidden = markHidden(original, blind)
      .filter((s) => s.hidden)
      .map((s) => s.text);
    expect(hidden).toEqual(["Aino", "Turku"]);
  });

  it("uses the answer alone when there is no follow-up", () => {
    expect(compareTexts({ answer: "Plan.", explain: "" }, { work: "Plan.", explain: [] })).toEqual({ original: "Plan.", blind: "Plan." });
  });
});

describe("clipForDisplay", () => {
  it("keeps a short job as typed, with spaces tidied", () => {
    expect(clipForDisplay("  Football   coach ")).toBe("Football coach");
  });

  it("cuts a long job at a word, with an ellipsis, within 60 characters", () => {
    const long = "senior principal staff distinguished fellow of robotics and everything else besides";
    const clipped = clipForDisplay(long);
    expect(clipped.endsWith("…")).toBe(true);
    expect(Array.from(clipped).length).toBeLessThanOrEqual(60);
    expect(long.startsWith(clipped.slice(0, -1))).toBe(true);
    expect(clipped.slice(0, -1).endsWith(" ")).toBe(false);
  });

  it("never splits an emoji, and cuts a run without spaces where it must", () => {
    const clipped = clipForDisplay("🤖".repeat(80));
    expect(Array.from(clipped)).toHaveLength(60);
    expect(clipped.endsWith("🤖…")).toBe(true);
  });
});

describe("words on the practice screens", () => {
  it("says where the practice proof goes", () => {
    expect(practiceLine(true)).toBe("Practice. Shown blind on this table's screen: label and task only.");
    expect(practiceLine(false)).toBe("Practice. Not sent to any company.");
  });

  it("tells the truth about the name", () => {
    expect(nameLine(true)).toBe("Your name was used once to hide it. It was not kept.");
    expect(nameLine(false)).toBe("You gave no name. Nothing identifies you here.");
  });

  it("counts steps in words", () => {
    expect(stepWords(2, 5)).toBe("Step 2 of 5");
  });
});
