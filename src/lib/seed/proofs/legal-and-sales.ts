import type { SeedProof } from "../types";

/**
 * Kivira Labs' supplier contract, and the engineer choice shared by Vesto Controls and Saarnivo Grid.
 * Synthetic people and work.
 */
export const LEGAL_AND_SALES_PROOFS: SeedProof[] = [
  {
    id: "proof_contract_01",
    person: "zainab",
    challenge: "kivira-contract",
    hoursAgo: 105,
    shareWithSimilar: true,
    answer: [
      "The risk is 8.4. The supplier may process our customers' personal data in any country and add subprocessors without telling us. We are the controller, so if the data goes to a country without safeguards, the fine and the breach are ours.",
      "Fixed clause: \"The supplier processes personal data only in the EU or EEA, under the attached data processing agreement. It names its subprocessors and tells the customer 30 days before adding one, and the customer may object.\"",
      "The rest is normal. The renewal in 2.1 has a fair 3-month notice, and 7.1 already leaves data breaches outside the cap.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Okay Zainab, slowly. Renewal, three months notice, normal. Price fixed two years, fine. Service level, credits, fine. Liability, capped at twelve months but data protection is outside the cap, good, that protects us. Eight four. Any country. Subprocessors without notice. There it is. That's personal data, we're the controller, we need a processing agreement and to know where it goes. Termination, law, normal. So one clause. Now write the fix so the business owner gets it in one read.",
      seconds: 620,
    },
    explainAnswers: [
      "8.4, because personal data leaving the EU without safeguards is a breach of the law, whatever the contract says.",
      "Then we should not sign. I would tell the business owner the risk in two lines and ask for an offer from a second supplier.",
    ],
    decision: {
      companyId: "co-kivira",
      kind: "meet",
      points: [5, 5, 4, 5],
      feedback:
        "You found 8.4, said what it means for us, and wrote a fixed clause our business owner can read in one go. Leaving the normal clauses alone, with a reason, saves us time too. We would like to meet you.",
      hoursToReply: 4,
      meeting: "declined",
    },
  },
  {
    id: "proof_contract_02",
    person: "hanna",
    challenge: "kivira-contract",
    hoursAgo: 70,
    shareWithSimilar: false,
    answer: [
      "Clause 2.1 is the risk. The contract renews for 12 months by itself, and if we forget the 3-month notice we are stuck with the supplier for another year.",
      "Fix: \"The contract ends after 24 months unless both parties agree in writing to continue.\"",
      "I would also ask for a lower price after the first 24 months.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Twenty-four months, then it renews by itself. Hmm, that's how people get stuck. If nobody puts the date in a calendar, another year. That feels risky. Let me check the rest. Price fixed, okay. Liability twelve months. Personal data... any country, subprocessors. Hmm, that's normal for cloud services, I think. Okay, renewal is the one I'd change.",
      seconds: 380,
    },
    explainAnswers: [
      "The renewal, because a forgotten date costs a full year of fees.",
      "With signing this week, I would sign and put the cancel date in the shared calendar today.",
    ],
    decision: {
      companyId: "co-kivira",
      kind: "pass",
      points: [2, 2, 2, 3],
      feedback:
        "Your fix to the renewal is clear and the calendar idea is practical. The renewal has a normal notice period; the clause that puts us at risk is 8.4, where our customers' personal data can go to any country. This role reviews data clauses every week, so it is not now.",
      hoursToReply: 3,
    },
  },
  {
    id: "proof_contract_03",
    person: "tuomas",
    challenge: "kivira-contract",
    hoursAgo: 26,
    shareWithSimilar: true,
    answer: [
      "8.4 puts us at risk: our customers' personal data could be processed anywhere and passed to subprocessors we do not know.",
      "What could happen: a data breach at an unknown subprocessor, and we answer for it to our customers and to the data protection office.",
      "Change: \"The supplier processes personal data only in the EU. Subprocessors need the customer's written approval.\"",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Okay, go clause by clause. Two one, renewal, that's standard. Four one, fine. Five two, fine. Seven one, the cap... wait, does the cap cover a data breach? No, it says except data protection. Good. Eight four, any country, subprocessors without telling. That's it. I'll keep the fix short. Written approval for subprocessors, EU only. Done.",
      seconds: 420,
    },
    explainAnswers: [
      "I checked 7.1 first, because a cap that covers data breaches would have been the other big risk.",
      "With signing this week, I would send the supplier the fixed 8.4 today and sign only when they accept it.",
    ],
    decision: {
      companyId: "co-kivira",
      kind: "hold",
      points: [4, 4, 3, 3],
      feedback:
        "You found 8.4 and checked 7.1 on the way, which shows a careful read. The fixed clause leaves out a data processing agreement, and the note to the business owner could say more plainly what we would lose. We will decide after the event.",
      hoursToReply: 2,
    },
  },
  {
    id: "proof_account_01",
    person: "tomasz",
    challenge: "pooled-account",
    hoursAgo: 44,
    shareWithSimilar: true,
    choice: "b",
    answer: [
      "Customer A waits two days. Customer B gets the engineer on Monday and Tuesday, and Customer A gets him from Wednesday to Friday plus one day of their own staff running tests.",
      "A goes live in 9 days, so two days later costs no penalty. B's school opens on Wednesday, and pupils need working air handling.",
      "I call A first, today: I tell them the engineer starts Wednesday, ask which tests their staff can run on Monday, and offer to call their project lead every evening.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Okay, A is the big one, forty percent, and the penalty. My first thought is A, obviously. But wait, go-live in nine days. Not Monday. B needs two days and the school opens Wednesday. So if B goes first, Monday Tuesday, A starts Wednesday. A needs four days, we have three left... their own staff can run some tests. So it fits. Nobody pays a penalty. At Lumivaara Oy I had this exact fight with two hospitals. Now how do I tell A. Call them first, before they hear it from someone else.",
      seconds: 590,
    },
    explainAnswers: [
      "I checked A's real deadline first, because the size of a customer is not the same as the date they need you.",
      "Weekend work would let both jobs fit with room to spare, so I would say yes and keep A's start on Wednesday.",
    ],
    decision: {
      companyId: "co-vesto",
      kind: "meet",
      points: [4, 4, 5, 4],
      feedback:
        "You saw that both jobs fit if the school goes first, and you used each customer's real deadline. Calling the bigger customer first, with a plan for their own staff, is how we want it done. Let us meet at the event.",
      hoursToReply: 3,
      meeting: "invited",
    },
  },
  {
    id: "proof_account_02",
    person: "ana",
    challenge: "pooled-account",
    hoursAgo: 30,
    shareWithSimilar: false,
    choice: "a",
    answer: [
      "Customer B waits. A is 40% of our sales and renews in March, and a late go-live costs 2 000 EUR a day.",
      "I would tell B that we are fully booked next week and offer the engineer for the following Monday, with a small discount for the trouble.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Forty percent of sales, that settles it, I think. Renewal in March, you don't upset that customer. Penalty two thousand a day. B is new, one school. They can wait a week. Hmm, the school opens Wednesday though. But they're not paying us much yet. Okay, B waits, I'll offer a discount so they stay happy.",
      seconds: 300,
    },
    explainAnswers: [
      "The size of A, because losing the renewal would cost more than any one job.",
      "Then A stays first, and I would ask the director about a second engineer for the school on Monday.",
    ],
    decision: {
      companyId: "co-saarnivo",
      kind: "pass",
      points: [3, 2, 3, 3],
      feedback:
        "You named the renewal and the penalty clearly, and the weekend idea in your second answer is a good one. A goes live in 9 days, so it could have waited two days while the school opened on time. This role plans engineers for many customers each week, so it is not now.",
      hoursToReply: 2,
    },
  },
  {
    id: "proof_account_03",
    person: "kwame",
    challenge: "pooled-account",
    hoursAgo: 6,
    shareWithSimilar: true,
    choice: "b",
    answer: [
      "B goes first, A waits.",
      "The school opens on Wednesday and the children need fresh air in the classrooms. A goes live in 9 days and has some of their own staff for tests.",
      "I would phone A on Friday and tell them the engineer comes on Wednesday.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "School, Wednesday, kids, air. That's the hard date. Hospital, nine days. So B first. How long does B need, two days, okay. And A needs four. Monday, Tuesday for B, then Wednesday to Friday is three. Hmm, one short. Their staff can run some tests. That might cover it. I won't overthink it. B first, call A.",
      seconds: 290,
    },
    explainAnswers: [
      "The school's date, because it cannot move and the hospital's can absorb two days.",
      "Then A goes first, and I would call the school about a short delay or another contractor for the air handling.",
    ],
    decision: {
      companyId: "co-vesto",
      kind: "pass",
      points: [3, 3, 4, 3],
      feedback:
        "You found the hard date and the order that fits both jobs. Telling A only on Friday is late for a customer this size, and the answer did not name the penalty or the renewal you weighed. This role plans calls like the one with A every week, so it is not now.",
      hoursToReply: 2,
    },
  },
];
