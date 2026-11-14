import { describe, expect, it } from "vitest";
import { findJudgement } from "./no-judgement";

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
  // Added from a second independent review.
  "Correctly identifies the split leak", "The right fix for leakage", "An accurate diagnosis", "A thorough review",
  "A convincing argument", "Clear and well-structured", "Spot on", "Nails the threshold issue", "Hits every planted flaw",
  "Nothing missed", "A complete answer", "Comprehensive coverage", "An incomplete answer", "Partially correct",
  "The answer is wrong about recall", "Misunderstands the metric", "Confused reasoning", "Solid grasp of evaluation",
  "Give 1 to 5 points on how well they fit", "Count how many of the three bugs they find; invite only if three",
  "Finds the two planted flaws", "Catches the threshold flaw and the split flaw", "Misses the threshold flaw",
  "Would be a great addition to the team", "Ready for a senior role", "Needs more experience", "Not ready yet",
  "Worth bringing in", "Let's talk to this one", "Move forward with this applicant", "Go for it", "No-brainer",
  "Exactly what we need", "The clear favourite", "Ahead of the pack", "Beats the other submissions",
  "Hyvä vastaus kaikin puolin", "Kannattaa kutsua juttelemaan", "Ei vakuuta", "Mycket bra svar", "Bör kallas till intervju",
  "Svagt svar", "Puutteellinen vastaus", "Osaava tekijä",
  // Scales in a review guide.
  "Rate each answer on a scale.", "Score out of 10.", "Grade the answers.", "Give 3 points for each bug found.",
  // Recommending a person or their work: the word "recommend" only counts when it points at one.
  "We recommend moving forward with this person.", "I recommend this candidate.", "Recommended for an interview.",
  "We would recommend hiring her.", "I recommend this answer to the team.", "Highly recommended.", "Not recommended.", "Recommended.",
  "Our hiring recommendation is to meet them.",
  // What a person found, reported: still a count against the material.
  "They find the flaw in the split.", "Did not catch the flaw in the totals.", "The answer identifies both flaws.",
  // Character tricks.
  "Rеcommended", "Excel\u200blent work.", "Ｅｘｃｅｌｌｅｎｔ", "e x c e l l e n t",
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
  "The error rate the team sees doubled.", "Add a rate limit of 60 requests a minute.", "Write a clear explanation for the customer.",
  "The feature is not ready for release until the review is done.", "Add the item to the user's favourites.",
  "Compute the anomaly score for each reading.", "QA found two bugs last week.", "Check that the totals are correct.",
  "Users misread the dose label.", "The font-weight and line height are off.", "Status reporting: monthly email to the customer.",
  // "Recommend" as task content: a section of the work, a product feature, a vendor's advice.
  "Recommendations", "Recommendations: move the refund after the database write.", "The report ends with three recommendations for the board.",
  "Our recommendation engine suggests products from past orders.", "The vendor recommends a 30-second timeout.",
  "Write two recommendations for the finance team.",
  // Asking the person to look for problems is the task, not a verdict.
  "Catch flaws before the change ships.", "Read the change and find flaws in the retry logic.", "Can you spot flaws in this plan?",
];

describe("no-judgement guard", () => {
  it.each(JUDGING)("rejects %s", (phrase) => {
    expect(findJudgement(phrase).length).toBeGreaterThan(0);
  });

  it.each(NEUTRAL)("passes %s", (phrase) => {
    expect(findJudgement(phrase)).toEqual([]);
  });
});
