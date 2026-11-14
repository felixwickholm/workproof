import type { StoryStage } from "@/lib/domain/types";
import type { SeedDecision, SeedProof } from "./types";

/** The story stages in order. Each stage is the previous one plus a few changes. */
export const STORY_STAGES: readonly StoryStage[] = ["before", "sent", "invited", "met"];

export function stageReached(stage: StoryStage, at: StoryStage): boolean {
  return STORY_STAGES.indexOf(stage) >= STORY_STAGES.indexOf(at);
}

/** The story proof. Its id gives the label "Proof K7", which the tour and the landing page use. */
export const STORY_PROOF_ID = "proof_story_halla_82";
export const STORY_CHALLENGE_ID = "ch-halla-order-form";
export const STORY_COMPANY_ID = "co-halla";
/** The customer service lead at Halla Supply who scores the story proof and invites Mikko. */
export const STORY_REVIEWER = "Laura Niemi";

/** Mikko's earlier feature-list cut, answered "not now" with points and a reason. */
export const MIKKO_EARLIER_ID = "proof_story_product";

/**
 * Mikko Lahtinen is a designer with two years of freelance web work. He has no big employer
 * and no famous school behind him, and 40 applications got no interview. His earlier proofs: a feature-list cut
 * that got "not now" with points and a reason, and a chart reading that waits for an answer.
 */
export const MIKKO_EARLIER: SeedProof[] = [
  {
    id: MIKKO_EARLIER_ID,
    person: "mikko",
    challenge: "pooled-product",
    hoursAgo: 88,
    shareWithSimilar: true,
    answer: [
      "Ships: 1 the double robot fix (4 days), 9 tickets say it confuses people. 2 export to Excel (3 days), all three pilots asked. 3 offline mode (5 days), one pilot needs it from 1 March.",
      "That is 12 days, so 4 days stay as a buffer for testing.",
      "Waits: dark mode and the animation, nobody outside the team asked. The push alert waits, 6 days is too big for this release. The pause button waits for the next one.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Sixteen days, list says twenty-seven. Okay. The fix goes first, nine tickets, that's real users. Export, all three pilots, easy yes. Then offline mode, five days, one customer but they have a date. That's twelve. Dark mode, no. Animation, no. Push alert is six days, too big. The pause button... two days, hmm, I'll keep it for later, I want the buffer for testing. Yes, leave four days.",
      seconds: 410,
    },
    explainAnswers: [
      "The fix first, because people who see a robot twice stop trusting the screen.",
      "Then offline mode moves out and the pause button comes in, because it is only two days and two pilots asked.",
    ],
    decision: {
      companyId: "co-tuulos",
      kind: "pass",
      points: [4, 3, 4, 2],
      feedback:
        "You kept the fix and the export and gave one clear line for each. You left out the pause button that two pilot warehouses asked for, and you did not say how we would know the cut worked. This role talks with our warehouse customers every week, so it is not now.",
      hoursToReply: 6,
    },
  },
  {
    id: "proof_story_chart",
    person: "mikko",
    challenge: "saarnivo-chart",
    hoursAgo: 28,
    shareWithSimilar: true,
    answer: [
      "The forecast is about 10% too low at the peak on the two coldest days: Wednesday 466 MW against 511, Thursday 478 against 529.",
      "Those are the hours when you buy reserve power, so the 2.1% average hides the most expensive misses.",
      "I would not call it ready for winter. First check how many days under -15 °C the model learned from.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Two lines, almost on top of each other. Fine. But look at Wednesday, and Thursday. That's the cold, minus seventeen, minus nineteen. Forty-five megawatts short, fifty-one. So the average is nice but the peaks on cold days are off by ten percent. And that's exactly when they buy reserve. So the note is wrong, it's not ready for winter.",
      seconds: 300,
    },
    explainAnswers: [
      "The cold peaks, because reserve power is bought for exactly those hours.",
      "Then I would add the temperature under the chart, so the team sees the misses line up with the cold.",
    ],
  },
];

/** The story proof: Mikko's answer for Halla Supply. The details that identify him are hidden before anyone reads it. */
export const MIKKO_STORY: SeedProof = {
  id: STORY_PROOF_ID,
  person: "mikko",
  challenge: "halla-order-form",
  hoursAgo: 0.92,
  shareWithSimilar: true,
  answer: [
    "Put the whole order on one page that works on a phone.",
    "1. Find parts by pump model, with a picture of each part. Installers know the model, not our codes.",
    "2. Remember the address and the customer number after the first order. Nobody should type them twice.",
    "3. Show the delivery price next to each choice, so there is no surprise on the next page.",
    "4. Make Order reference optional and say what it is: your own job number, if you have one.",
    "5. After sending, show the order number and delivery date, and email them. That answers most of the 40 calls a day.",
    "6. Add Order the same again, because installers often need the same part twice.",
    "Last spring I redesigned the order page for Kotiranta Oy. I live in Matinkylä and studied at Metropolia.",
    "Mikko Lahtinen",
  ].join("\n"),
  thinkAloud: {
    transcript:
      "Okay. An order form for installers. Four steps. Step one, customer number from the invoice. Hmm, who has an invoice in a van? Step two, product code. That's the big one, they say it themselves, they know the pump model, not the code. So search by model, with pictures. Step three, the address every time. Just save it. Prices on the next page, that's annoying, show them right there. Order reference, required, no help. I'd make it optional. And after send, no order number. Wait, that's the forty calls a day. So the confirmation matters most, actually. One page, on a phone. Okay, let me write it down.",
    seconds: 540,
  },
  explainAnswers: [
    "The order number and the delivery date first, because that is what the 40 calls a day ask about.",
    "Then I would keep the search by pump model and the confirmation, and leave the rest for next month.",
  ],
  spokenFollowUps: true,
};

/** Laura Niemi's decision on the story proof, from stage "invited". His work gets 9 of 10. */
export const STORY_DECISION: Omit<SeedDecision, "hoursToReply"> & { hoursAgo: number } = {
  companyId: STORY_COMPANY_ID,
  kind: "meet",
  points: [5, 5, 4, 4],
  feedback:
    "You found the three places where installers give up, and your form is shorter, not busier. Search by pump model and a clear order number are changes we could build this month.",
  hoursAgo: 0.5,
};

/** At stage "met": hours ago Mikko accepted, and hours ago both sides confirmed the talk and agreed a follow-up. */
export const MIKKO_ACCEPTED_HOURS_AGO = 0.3;
export const STORY_MET_HOURS_AGO = 0.1;
