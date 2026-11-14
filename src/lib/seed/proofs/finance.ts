import type { SeedProof } from "../types";

/** Saarnivo Grid's budget task: one wrong number in a launch event budget. Synthetic people and work. */
export const FINANCE_PROOFS: SeedProof[] = [
  {
    id: "proof_budget_01",
    person: "haider",
    challenge: "saarnivo-budget",
    hoursAgo: 90,
    shareWithSimilar: true,
    answer: [
      "The wrong number is the catering quantity: 150 guests, but the notes say 180 have said yes.",
      "Right row: 180 x 18 = 3 240 EUR, not 2 700. That is 540 more.",
      "New subtotal 13 450, contingency 10% is 1 345, total 14 795.",
      "So the budget is now 295 EUR over the approved limit of 14 500.",
      "The event team has to decide before Friday: cut 295 somewhere (the social ads are the easiest line to trim) or ask for a higher limit.",
      "The other rows check out: venue, samples, video, travel all multiply correctly.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "First I just multiply every row. Venue, fine. Catering, one fifty times eighteen, twenty-seven hundred, fine. Samples, two thousand times one twenty, twenty-four hundred, fine. Hmm, so the sums are all right. Then it's not a sum. Let me read the notes. One hundred eighty said yes. There it is, the catering has one fifty. So redo it, three two four oh. And then the contingency moves too, I almost forgot that. Fourteen seven nine five. Over the limit.",
      seconds: 520,
    },
    explainAnswers: [
      "I multiplied every row first, so when all sums were right I knew to look at the notes instead.",
      "If 20 more guests say yes on Thursday, catering grows by 360 more and the total is about 15 190, so the limit question gets bigger.",
    ],
    decision: {
      companyId: "co-saarnivo",
      kind: "meet",
      points: [5, 4, 4, 4],
      feedback:
        "You checked every row, then found the guest count in the notes and followed it all the way to the limit. You also told the event team what they have to decide. We would like to meet you.",
      hoursToReply: 3,
      meeting: "accepted",
    },
  },
  {
    id: "proof_budget_02",
    person: "abdirahman",
    challenge: "saarnivo-budget",
    hoursAgo: 50,
    shareWithSimilar: true,
    answer: [
      "Catering is counted for 150 guests. The note says 180 said yes.",
      "Correct catering: 3 240 EUR. The total rises by 540 plus the contingency on it.",
      "I would tell the event team the total is now close to or above the limit and they should check before signing on Friday.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Okay, the table, top to bottom. Contingency, ten percent of twelve nine ten, twelve ninety-one, yes. Hmm, that one looks odd but it's right. Catering... one fifty guests. Where's the guest count? Notes. One eighty. So that's the wrong number. Eighteen times one eighty, three thousand two hundred forty. Total goes up... I won't do the full math, it's around the limit anyway. I'll just flag it to the team.",
      seconds: 330,
      screen: {
        kind: "video",
        src: "/demo/screen-budget.webm",
        poster: "/demo/screen-budget.jpg",
        seconds: 12,
        alt: "Screen recording of the budget table. The cursor moves down the rows and marks the catering cell, then the guest note.",
      },
    },
    explainAnswers: [
      "The guest count drives the catering, so it was the row most likely to go out of date.",
      "If the limit cannot go up, the team has to cut something, probably part of the social ads.",
    ],
    decision: {
      companyId: "co-saarnivo",
      kind: "hold",
      points: [3, 4, 4, 3],
      feedback:
        "You found the guest count and fixed the catering row quickly. You stopped before the new total, so the team does not yet know it goes over the limit. We will decide after the first talks at the event.",
      hoursToReply: 2.5,
    },
  },
  {
    id: "proof_budget_03",
    person: "elsa",
    challenge: "saarnivo-budget",
    hoursAgo: 20,
    shareWithSimilar: false,
    answer: [
      "The contingency looks wrong to me. 10% should be counted on the total, not on the subtotal, so it should be about 1 420.",
      "Also the social ads have no quantity or unit price, so we cannot check them.",
      "I would ask the event team to fix the contingency and send the ad quote.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Ten percent contingency. Of what, though. Of twelve nine ten. Hmm, I think contingency usually goes on the whole thing. So that's the wrong one? Let me also check the ads, three thousand, no unit, no quantity, weird. I learned at Hanken to always ask for the quote. Catering, eighteen times one fifty, fine. Okay, I'll say the contingency. And ask for the ad quote.",
      seconds: 300,
    },
    explainAnswers: [
      "The contingency is the only row that depends on other rows, so I checked it first.",
      "If the social ads are already paid, I would leave that row and focus on the contingency.",
    ],
    decision: {
      companyId: "co-saarnivo",
      kind: "pass",
      points: [2, 2, 3, 3],
      feedback:
        "Asking for the ad quote is a good habit. The contingency on the subtotal is how our budgets work, and the row that was wrong is catering, which uses 150 guests while the notes say 180. This role checks numbers against notes every week, so it is not now.",
      hoursToReply: 1.5,
    },
  },
];
