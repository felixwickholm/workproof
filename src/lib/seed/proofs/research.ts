import type { SeedProof } from "../types";

/**
 * Hohka Materials' result table: does the coating test support the claim "30% longer"? The gain shows only at
 * 25 °C, the 45 °C groups have four cells each, and the coated cells came from a newer batch. Synthetic work.
 */
export const RESEARCH_PROOFS: SeedProof[] = [
  {
    id: "proof_res_01",
    person: "yusuf",
    challenge: "hohka-results",
    hoursAgo: 140,
    shareWithSimilar: true,
    answer: [
      "No, the table does not support the claim as written.",
      "At 25 °C the coated cells reach 1 040 cycles against 800, so +30%. At 45 °C it is 540 against 520, only +4%, and with 4 cells per group that could be noise.",
      "Also, the coated cells come from the October batch and the uncoated from May. A newer batch alone can add cycles, so part of the 30% may not be the coating.",
      "Fairer claim: \"At 25 °C, coated cells lasted 30% longer in one lab test. We are still testing at higher temperatures.\"",
      "Next test: coat half of one batch, keep half bare, and test 20 cells of each at 45 °C.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Okay, thirty percent. Eight hundred to ten forty, yes, that's thirty. So the claim is right? Hmm, wait, that's only the twenty-five degree rows. At forty-five it's five forty against five twenty. That's nothing. Four percent, and four cells. And then the notes at the bottom, October and May. Different batches. So even the thirty might be the batch. I'd split one batch in two and coat half, that removes the batch question.",
      seconds: 610,
    },
    explainAnswers: [
      "I started with the 45 °C rows, because a customer who uses the cells in heat would buy on the 30% and get 4%.",
      "If a customer uses the cells in hot cars, I would not let the claim go out at all until the 45 °C test has at least 20 cells per group.",
    ],
    decision: {
      companyId: "co-hohka",
      kind: "meet",
      points: [5, 5, 4, 4],
      feedback:
        "You saw that the 30% holds only at 25 °C and that the batches differ, and your next test removes the batch question in one step. We would like to talk about how you would plan our next cycle test.",
      hoursToReply: 3,
      meeting: "met",
      followUpAgreed: false,
    },
  },
  {
    id: "proof_res_02",
    person: "priya",
    challenge: "hohka-results",
    hoursAgo: 35,
    shareWithSimilar: true,
    answer: [
      "Partly. At 25 °C, 1 040 vs 800 cycles is a real gain of 30%.",
      "But the claim says the cells last 30% longer, with no temperature. At 45 °C the gain is 20 cycles, about 4%, from 4 cells per group. That is too few cells to say anything, so the summary should not cover heat at all.",
      "I would also ask for the spread, not only the average. 20 cells with a wide spread could still overlap.",
      "Suggested claim: \"In a 25 °C lab test, coated cells lasted 30% longer.\"",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Right, Priya, slow down and read the whole table first. Uncoated, coated, twenty cells, twenty cells. Thirty percent, fine. Then forty-five degrees, four cells. Four. That's not a test, that's a try. Plus four percent. And the claim doesn't say a temperature, so a reader thinks it's always thirty. What's missing... the spread. An average from twenty cells with no spread, I can't tell if it overlaps. I'll ask for that.",
      seconds: 520,
    },
    explainAnswers: [
      "The missing temperature in the claim, because that is the part a customer would believe and act on.",
      "If I could test 20 more cells in one group, I would put them in the 45 °C coated group, since that is where the claim is weakest.",
    ],
    decision: {
      companyId: "co-hohka",
      kind: "meet",
      points: [4, 3, 5, 3],
      feedback:
        "You asked for the spread and not only the average, and you limited the claim to the test that supports it. You did not notice the two batches. We would like to meet and hear how you would set up the next test.",
      hoursToReply: 2,
      meeting: "invited",
    },
  },
  {
    id: "proof_res_03",
    person: "johan",
    challenge: "hohka-results",
    hoursAgo: 80,
    shareWithSimilar: false,
    answer: [
      "The claim is supported. Coated cells did 1 040 cycles and uncoated 800, which is 30% more.",
      "The 45 °C test is much smaller, so I would leave it out of the summary.",
      "I would add \"in our lab tests\" to the claim so it is not too strong.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Ten forty divided by eight hundred, one point three. So thirty percent. Okay, the claim matches. There are more rows. Forty-five degrees, five forty and five twenty, small difference, but also small groups, only four cells. Maybe just drop that from the summary then. Anything else in the notes? One lab, batches... October, May. Fine. I'll add in our lab tests, that makes it safer.",
      seconds: 360,
    },
    explainAnswers: [
      "I started with the 25 °C rows because they have the most cells.",
      "If the sales team needs the claim by Friday, I would send it with \"in our lab tests\" added and nothing else changed.",
    ],
    decision: {
      companyId: "co-hohka",
      kind: "pass",
      points: [2, 2, 3, 2],
      feedback:
        "You checked the 30% correctly and noticed the 45 °C groups are small. The claim still speaks for all temperatures, and the October and May batches were read but not questioned. This role writes the claims our customers rely on, so it is not now.",
      hoursToReply: 2,
    },
  },
  {
    id: "proof_res_04",
    person: "xiaoling",
    challenge: "hohka-results",
    hoursAgo: 28,
    shareWithSimilar: true,
    answer: [
      "Not as written.",
      "1. The gain depends on temperature: +30% at 25 °C, +4% at 45 °C.",
      "2. The 45 °C result comes from 4 cells per group, too few to trust either way.",
      "3. Coated and uncoated cells come from different batches, so batch and coating are mixed together.",
      "Next step: test coated and uncoated cells from the same batch at 25 °C and 45 °C, 20 cells each.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Let me write the numbers down. Twenty-five degrees, eight hundred, ten forty. Forty-five, five twenty, five forty. So the effect almost disappears in heat. Or... is it the heat, or just four cells? Can't tell. Both, maybe. Batches, October and May, that's a confound, I'll put it as point three. Should I write a new claim? I think the list is clearer. Then one test that fixes both problems.",
      seconds: 480,
    },
    explainAnswers: [
      "The temperature first, because the claim hides it and the table shows the gain is not the same everywhere.",
      "If the summary must stay one sentence long, I would write: \"At 25 °C, coated cells lasted 30% longer in one lab test.\"",
    ],
    decision: {
      companyId: "co-hohka",
      kind: "hold",
      points: [4, 4, 3, 3],
      feedback:
        "Your three points are the right questions, and the same-batch test answers two of them at once. You did not write a new claim for the customers, which this role does every month. We will decide after we know how many places our lab team has in spring.",
      hoursToReply: 3,
    },
  },
];
