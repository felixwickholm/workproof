import { describe, expect, it } from "vitest";
import { countsFindings, findJudgement } from "./no-judgement";

/** Judging phrases from an independent review of the guard, English, Finnish and Swedish. */
const JUDGING = [
  "This answer is a 9 of 10.", "Nine out of ten.", "Grade: A+.", "A strong hire.", "Strong yes for an interview.",
  "I would advance this person to the next round.", "Invite this person to interview.", "Promising work.",
  "Top-notch reasoning.", "A cut above the rest.", "The most thorough answer in the queue.", "Better than most submissions.",
  "Clearly superior to the others.", "Senior-level thinking.", "Junior-level answer.", "This person is a keeper.",
  "Definitely worth a conversation.", "Fails to identify the main issue.", "Misses the key flaw.", "Only finds one of three issues.",
  "Finds all three planted flaws.", "Covers 2 of 3 issues.", "High quality work.", "Low quality work.", "Very good answer.",
  "Excellent", "Fantastic analysis.", "Shows deep expertise.", "Lacks rigor.", "Naive approach.", "Sloppy reasoning.",
  "Strong candidate", "Hire.", "Reject.", "Pass on this one.", "Meet this person.", "Thumbs up.", "5★", "★★★★★",
  "Percentile: 90th", "In the 90th percentile.", "The second strongest proof.", "Tier 1 candidate.", "A-tier work.",
  "Huomattavan hyvä vastaus.", "Erinomainen.", "Suosittelen haastattelua.", "Paras vastaus.", "9/10",
  // Added: grades, top N%, averages and more Finnish and Swedish verdicts.
  "Solid B+ work.", "Overall an A.", "She is in the top 5% of applicants.", "Above average reasoning.", "Below average.",
  "Outstanding.", "Mediocre analysis.", "Shortlist this person.", "Vahva ehdokas.", "Heikko vastaus.", "Paras hakija.",
  "Jag rekommenderar henne.", "Stark kandidat.", "Lovande arbete.",
];

/** Technical and descriptive text that must pass. */
const NEUTRAL = [
  "The query returns 10 rows.", "Retry 3 times with backoff.", "Proposes a change to the data split. Does not mention tests.",
  "Uses a best-effort queue for notifications.", "Follows best practice for secrets.", "Test coverage on this module is 70%.",
  "The model reports 97% accuracy on the test set.", "Adds a timeout of 5 seconds to the fetch call.",
  "Suggests a weak password check be replaced with a policy.", "Example: 1/2 + 1/3 = 2/5 is a common mistake.",
  "Step 1 of 3 creates the table.", "The endpoint rejects invalid input with a 400.", "Use a B-tree index on the column.",
  "Compile with C++ 20.", "Promise.reject is called on timeout.", "Meet the team in week 1.", "The race between two requests overbooks a slot.",
  "The upload handler returns 2 of 5 items per page.", "Discusses the threshold choice and the choice of metric.",
  "A naive datetime is compared with an aware one.", "Data quality checks run nightly.", "The sales team hires in spring.",
  "Promising a connector in two weeks is risky.", "Interview five users before the redesign.", "The canary runs on one robot first.",
];

describe("no-judgement guard", () => {
  it.each(JUDGING)("rejects %s", (phrase) => {
    expect(findJudgement(phrase).length).toBeGreaterThan(0);
  });

  it.each(NEUTRAL)("passes %s", (phrase) => {
    expect(findJudgement(phrase)).toEqual([]);
  });

  it("rejects summaries that count what an answer found", () => {
    expect(countsFindings("Names three issues in the change.")).toBe(true);
    expect(countsFindings("Covers most of the material.")).toBe(true);
    expect(countsFindings("Discusses the data split. Proposes a change to the split. Does not mention rollout.")).toBe(false);
  });
});
