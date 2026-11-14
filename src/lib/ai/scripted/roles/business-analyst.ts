import type { RoleTemplate } from "../role-template";

export const businessAnalyst: RoleTemplate = {
  id: "business-analyst",
  title: "Business or financial analyst",
  level: "degree",
  keywords: [
    "business analyst", "business analysis", "financial analyst", "finance analyst", "process analyst",
    "requirements analyst", "operations analyst", "management consultant", "consultant", "economist",
    "liiketoiminta-analyytikko", "talousanalyytikko", "prosessikehittäjä", "konsultti", "ekonomi",
  ],
  skills: ["budget-analysis", "bookkeeping-accuracy", "data-quality", "stakeholder-communication"],
  cues: {
    "budget-analysis": ["event budget", "business cases", "steering group", "change in the numbers"],
    "bookkeeping-accuracy": ["accuracy with numbers", "accuracy"],
    "stakeholder-communication": ["requirements", "workshops", "readers outside finance", "management team"],
  },
  why: {
    "budget-analysis": "The event team signs the orders on Friday, so the budget has to be right before then.",
    "bookkeeping-accuracy": "A row that looks right can still use the wrong count.",
    "data-quality": "The notes and the table were written by different people, and they do not always agree.",
  },
  lookFor: {
    "budget-analysis": "Finds the wrong number, gives the right one and follows it to the new total.",
    "bookkeeping-accuracy": "Checks rows against the notes, not only the sums against each other.",
    "data-quality": "Leaves the rows that are right alone, even when they look odd.",
    "stakeholder-communication": "Says in plain words what the event team has to decide now.",
  },
  constraints: [
    "the venue asks for the final guest count tomorrow",
    "the social ads are already paid",
    "the limit cannot go up",
    "twenty more guests say yes on Thursday",
  ],
  challenge: {
    minutes: 10,
    title: "One number in this budget is wrong. Find it",
    format: "fix",
    proofKind: "writing",
    brief:
      "We are a software company, and our event team made the budget for a spring launch event. The orders are signed on Friday. One number in the budget is wrong: which one, and what does it change? This is a synthetic example.",
    material: {
      kind: "text",
      title: "Spring launch event, budget (synthetic). Prices without VAT.",
      body: [
        "Row                     Qty   Unit (EUR)   Total (EUR)",
        "Venue hire                1        2 400         2 400",
        "Catering, per guest     150           18         2 700",
        "Sample packs          2 000         1.20         2 400",
        "Video crew, per day       2          950         1 900",
        "Social ads                                       3 000",
        "Staff travel              6           85           510",
        "Subtotal                                        12 910",
        "Contingency, 10%                                 1 291",
        "Total                                           14 201",
        "",
        "Approved limit: 14 500",
        "",
        "Notes from the event team",
        "- 180 guests have said yes.",
        "- The venue price includes chairs and sound.",
      ].join("\n"),
    },
    deliverable: "Name the wrong number, give the right one, and say what it changes.",
    flaws: [
      {
        label: "catering counted for 150 guests while 180 said yes",
        cues: ["150", "180", "catering", "guests", "3 240", "3240", "said yes"],
      },
      {
        label: "the corrected total that goes over the approved limit",
        cues: ["14 500", "14500", "limit", "over", "14 795", "14795", "cut", "295"],
      },
    ],
  },
  taster: {
    title: "Find the wrong number",
    format: "fix",
    proofKind: "writing",
    brief: "A small order for a team breakfast.",
    material: {
      kind: "text",
      title: "Breakfast order (EUR)",
      body: [
        "Coffee   40 x 2.50 = 100",
        "Rolls    40 x 1.50 =  80",
        "Total             = 180",
      ].join("\n"),
    },
    deliverable: "Which number is wrong, and how do you know?",
    flaws: [
      {
        label: "rolls counted as 80 euros when 40 x 1.50 is 60",
        cues: ["80", "60", "rolls", "1.50", "160", "total"],
      },
    ],
  },
};
