import type { SeedProof } from "../types";

/**
 * Halla Supply's "what should we automate first?" task. Synthetic people and work. The three newest
 * answers arrive just after Mikko's, so his is the oldest one waiting for Halla.
 */
export const AUTOMATION_PROOFS: SeedProof[] = [
  {
    id: "proof_ai_01",
    person: "joonas",
    challenge: "halla-automate",
    hoursAgo: 70,
    shareWithSimilar: true,
    answer: [
      "Start with the support emails. 400 a week is the biggest number on the list, and three people spend most of their day on them.",
      "Most ask where an order is, so a chatbot connected to the order system can answer them at once, day and night.",
      "Plan: week 1 connect a chatbot to the order data, week 2 put it on the website.",
      "Risk: customers may not like talking to a bot.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Okay, four rows. Support emails, four hundred a week, that's clearly the big one. Three people, most of a day. So if a bot takes those, that frees almost three people. Invoices, nine hundred a month, hmm, that's also a lot, but it's two people. I'll go with the chatbot. Two weeks... connect it to the orders, then launch. Risk, I guess people might find it annoying. Yeah. Done.",
      seconds: 360,
    },
    explainAnswers: [
      "I started with the emails because they take the most people.",
      "If the managing director wants the chatbot first, nothing changes, that is already my pick.",
    ],
    decision: {
      companyId: "co-halla",
      kind: "pass",
      points: [2, 2, 2, 3],
      feedback:
        "You read the email volume right and wrote clearly. A chatbot answers our installers directly, so a wrong delivery date reaches them before anyone sees it, and your plan does not say how the order data is checked first. For this role we need someone who weighs the risk of the first step, so it is not now.",
      hoursToReply: 2,
    },
  },
  {
    id: "proof_ai_02",
    person: "ravi",
    challenge: "halla-automate",
    hoursAgo: 66,
    shareWithSimilar: true,
    answer: [
      "My pick: the invoices.",
      "900 a month at about 2 minutes is 30 hours of typing, and 1 in 50 has a typo, so around 18 wrong invoices a month. Each one follows the same rule: delivery note in, invoice out.",
      "Days 1 to 3: collect 100 delivery notes and read them with a text reader. Days 4 to 7: match each note to the order and draft the invoice. Week 2: drafts go to the two people, who approve or fix them.",
      "What could go wrong: a misread quantity or price. Keep a person approving every invoice for a month and compare totals with the order system each Friday.",
      "The chatbot can come later, once the order data is clean.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Right. I want the thing that's frequent and boring and has a clear rule. Emails are frequent but every email is a bit different. Invoices... nine hundred a month, two minutes, that's thirty hours. And there's an error rate, one in fifty, so the automation can even fix something. At my last job at Rantalinja Oy we did delivery notes too, the photos were the hard part. So, typed notes first. A person approves, at least a month. Then the chatbot later.",
      seconds: 600,
    },
    explainAnswers: [
      "A wrong invoice can be caught by a person before it is sent, and a wrong chatbot answer cannot.",
      "If the notes come as phone photos, I would add a week to test the text reader on 50 real photos before the drafts start.",
    ],
    decision: {
      companyId: "co-halla",
      kind: "meet",
      points: [5, 4, 5, 4],
      feedback:
        "You counted the hours and the typos and picked the invoices for a clear reason. Keeping a person on every invoice for a month is exactly the safety we want. Let us talk about how you would start.",
      hoursToReply: 3,
      meeting: "met",
      followUpAgreed: true,
      hired: true,
    },
  },
  {
    id: "proof_ai_03",
    person: "sari",
    challenge: "halla-automate",
    hoursAgo: 0.65,
    shareWithSimilar: true,
    answer: [
      "I would automate the weekly sales report first.",
      "It is only 4 hours a week, but it is one person's whole Monday morning, and it is the easiest to build: pull data from the three systems and fill the same spreadsheet.",
      "Week 1: make a list that maps the product names between the three systems. Week 2: a script builds the report every Monday at 6.",
      "Risk: if the names do not match, numbers go to the wrong product. The sales lead checks the first four reports against her own.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Let me see. The report. Four hours, one person, every week. It's small, which is good for two weeks. Oh, but product names differ between three systems. Hmm, that's the real work, a mapping table. Okay, so week one is the mapping. Invoices are bigger, sure, but they touch money, I'd rather not start there. I studied at Haaga-Helia and we did a report like this in a course project. Okay, report it is.",
      seconds: 480,
    },
    explainAnswers: [
      "The report only goes inside the company, so a mistake does not reach a customer.",
      "If only one developer has time, I would still do the report, because it is the smallest of the three.",
    ],
  },
  {
    id: "proof_ai_04",
    person: "linh",
    challenge: "halla-automate",
    hoursAgo: 0.42,
    shareWithSimilar: false,
    answer: [
      "Invoices. They are 900 a month and follow one rule, and a typo in 1 of 50 means money problems for the installers.",
      "Plan: week 1 read the delivery notes, week 2 fill the invoice, and a person checks before sending.",
      "Risk: wrong amounts.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Invoices or emails. Emails are more, four hundred a week. But wait, invoices are nine hundred a month, that's about two hundred a week, and each one is the same steps. So invoices. The typo thing, one in fifty, that's annoying for customers. How to build it... read the note, fill in the invoice, check. I'm not sure how long the reading part takes. Two weeks should be okay. Risk is wrong numbers.",
      seconds: 270,
    },
    explainAnswers: [
      "The invoices follow the same rule every time, so they are easier to automate safely.",
      "If the accounting system cannot import data, the tool would make a file a person copies in, at least at first.",
    ],
  },
  {
    id: "proof_ai_05",
    person: "matilda",
    challenge: "halla-automate",
    hoursAgo: 0.17,
    shareWithSimilar: true,
    spoken: true,
    answer:
      "So, I'd split the support emails. Not a chatbot that talks back, just a small tool. Most of the four hundred ask where the order is, right? So the tool reads the order number from the email and drafts a reply with the tracking status, and the support person presses send. First week, sort a hundred old emails to see how many are really just tracking. Second week, the drafts. Risk is the wrong order number, so a person always sends it. The invoices are maybe even more time, I see that, but the people answering emails are the ones drowning.",
    thinkAloud: {
      transcript:
        "Hmm, everyone will say chatbot. I don't want a chatbot. Okay but the emails are still the pain. What if it only drafts? Yes. The person still sends. So the risk is small. Wait, should I do the invoices instead? Thirty hours a month... that's a lot too. But the email people are three, the invoice people are two. Ugh. I'll stay with emails, drafts only. Matilda here, by the way, I'm recording this from my kitchen in Kallio, sorry about the noise.",
      seconds: 390,
    },
    explainAnswers: [
      "I started there because a draft that a person sends cannot surprise a customer.",
      "If the managing director wants the chatbot first, I would show him this as step one of the chatbot, with a person still in the loop.",
    ],
    spokenFollowUps: true,
  },
];
