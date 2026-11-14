import type { StoryStage } from "@/lib/domain/types";
import type { SeedDecision, SeedProof } from "./types";

/** The story stages in order. Each stage is the previous one plus a few changes. */
export const STORY_STAGES: readonly StoryStage[] = ["before", "sent", "invited", "met"];

export function stageReached(stage: StoryStage, at: StoryStage): boolean {
  return STORY_STAGES.indexOf(stage) >= STORY_STAGES.indexOf(at);
}

/** The story proof. Its id gives the label "Proof K7", which the tour and the landing page use. */
export const STORY_PROOF_ID = "proof_story_halla_82";
export const STORY_CHALLENGE_ID = "ch-halla-automate";
export const STORY_COMPANY_ID = "co-halla";
/** The finance and AI lead at Halla Supply who scores the story proof and invites Olena. */
export const STORY_REVIEWER = "Katja Nurmi";

/** Olena's earlier feature-list cut, answered "not now" with points and a reason. */
export const OLENA_EARLIER_ID = "proof_story_product";

/**
 * Olena Kovalenko is an AI developer with two years of freelance automation work. Her CV names no big
 * employer and no famous school, and 40 applications got no interview. Her earlier proofs: a feature-list cut
 * that got "not now" with points and a reason, and a chart reading that waits for an answer.
 */
export const OLENA_EARLIER: SeedProof[] = [
  {
    id: OLENA_EARLIER_ID,
    person: "olena",
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
    person: "olena",
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

/** The story proof: Olena's answer for Halla Supply. The details that identify her are hidden before anyone reads it. */
export const OLENA_STORY: SeedProof = {
  id: STORY_PROOF_ID,
  person: "olena",
  challenge: "halla-automate",
  hoursAgo: 0.92,
  shareWithSimilar: true,
  answer: [
    "Automate the invoices first.",
    "900 a month at two minutes each is about 30 hours of typing, and about 18 have a typo. The rule is the same every time: one delivery note, one invoice.",
    "Not the support chatbot first. Its mistakes go straight to customers, and it needs clean order data anyway.",
    "Week 1: read 200 old delivery notes with a text reader and match them to the order system. Week 2: the tool drafts the invoices, and a person approves each one.",
    "Risk: a wrong amount or the wrong customer. For the first month a person approves every invoice, and we compare the totals each week.",
    "Last spring I built the same flow for Kotiranta Oy. I live in Matinkylä and studied at Metropolia.",
    "Olena Kovalenko",
  ].join("\n"),
  thinkAloud: {
    transcript:
      "Okay. Three things to choose from. Support emails, four hundred a week, that's the biggest number, so a chatbot, right? That's what everyone wants. Hmm, no, wait. If the bot gives a wrong delivery date, the customer sees it right away. Let me count the invoices. Nine hundred a month, two minutes each, that's thirty hours. One in fifty has a typo, so eighteen wrong invoices a month. And it's the same rule every time. A person can check them before they go out. Okay, invoices first. The report is only four hours a week, and the product names don't match, so that's a cleaning job. Later.",
    seconds: 540,
  },
  explainAnswers: [
    "The invoices first, because a mistake there can be caught before it leaves the building.",
    "Then I would start with the notes that are typed, and keep the photos for week 3.",
  ],
  spokenFollowUps: true,
};

/** Katja Nurmi's decision on the story proof, from stage "invited". Her work gets 9 of 10. */
export const STORY_DECISION: Omit<SeedDecision, "hoursToReply"> & { hoursAgo: number } = {
  companyId: STORY_COMPANY_ID,
  kind: "meet",
  points: [5, 5, 4, 4],
  feedback: "You picked the invoices, not the chatbot, and you said why. Your two-week plan is one we could start on Monday.",
  hoursAgo: 0.5,
};

/** At stage "met": hours ago Olena accepted, and hours ago both sides confirmed the talk and agreed a follow-up. */
export const OLENA_ACCEPTED_HOURS_AGO = 0.3;
export const STORY_MET_HOURS_AGO = 0.1;
