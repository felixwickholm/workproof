import type { RoleTemplate } from "../role-template";

export const businessAnalyst: RoleTemplate = {
  id: "business-analyst",
  title: "Business analyst",
  level: "degree",
  keywords: [
    "business analyst", "business analysis", "process analyst", "requirements analyst", "operations analyst",
    "management consultant", "consultant", "economist", "financial analyst", "liiketoiminta-analyytikko",
    "prosessikehittäjä", "konsultti", "ekonomi",
  ],
  skills: ["metrics-definition", "data-quality", "stakeholder-communication", "prioritisation"],
  cues: {
    "metrics-definition": ["processes", "steering group", "business cases"],
    "stakeholder-communication": ["requirements", "workshops"],
  },
  why: {
    "metrics-definition": "A steering group decides on the number in the summary, so the number has to mean what it says.",
    prioritisation: "A proposal is worth its cost only if it fixes the problem the steering group asked about.",
  },
  lookFor: {
    "metrics-definition": "Asks how each figure was counted and over which period before trusting the conclusion.",
    "data-quality": "Notices when the sample is small or from an unusual week, and proposes a fairer one.",
    prioritisation: "Ties the proposal back to the cause the data shows.",
  },
  constraints: [
    "the steering group meets tomorrow morning",
    "the ticket data for August is lost",
    "the vendor offers a discount if you sign this month",
    "the service desk manager disagrees with the figures",
  ],
  challenge: {
    title: "Check an AI-written process analysis before the steering group",
    format: "review",
    proofKind: "writing",
    brief:
      "Our IT service desk takes too long to solve requests, and the steering group asked why. An AI assistant analysed a ticket export and wrote the summary below. It goes to the steering group tomorrow. This is a synthetic example. Please check it as the business analyst.",
    material: {
      kind: "text",
      title: "Service desk analysis, summary (AI draft, synthetic)",
      body: [
        "Question from the steering group: why do requests take so long to solve?",
        "",
        "Data: ticket export, 1-7 July (412 tickets)",
        "",
        "Findings",
        "- Average time to solve: 4.8 days (calendar days, weekends included)",
        "- 61% of that time, tickets wait for the customer to answer",
        "- Solved at the first contact: 22%",
        "",
        "Comparison",
        "- Industry average: 1.2 days (source: a chatbot vendor's blog)",
        "",
        "Proposal",
        "- Buy the vendor's AI chatbot (60,000 EUR a year) to answer",
        "  customers faster.",
        "",
        "Decision asked: approve the purchase tomorrow.",
      ].join("\n"),
    },
    deliverable:
      "Write what you would change in the summary before the steering group sees it, and why. Start with what could lead them to the wrong decision.",
    flaws: [
      {
        label: "one holiday week in July used as the whole picture",
        cues: ["july", "one week", "holiday", "summer", "sample", "412", "longer period", "months"],
      },
      {
        label: "calendar days compared with a vendor's figure that may be counted another way",
        cues: ["calendar", "weekend", "working days", "vendor", "blog", "1.2", "same way", "source"],
      },
      {
        label: "a faster chatbot proposed while 61% of the time is spent waiting for the customer",
        cues: ["61", "waiting", "customer to answer", "chatbot", "reminder", "root cause", "cause"],
      },
    ],
  },
  taster: {
    title: "Read one finding",
    format: "review",
    proofKind: "writing",
    brief: "Lines from an AI-written sales report.",
    material: {
      kind: "text",
      title: "Report",
      body: [
        "Sales rose 40% in December.",
        "Conclusion: the new website works.",
        "Proposal: double the website budget.",
      ].join("\n"),
    },
    deliverable: "What would you check before anyone acts on this, and why?",
    flaws: [
      {
        label: "a seasonal rise read as the effect of the website",
        cues: ["december", "christmas", "season", "last year", "compare", "same month", "other cause", "holiday"],
      },
    ],
  },
};
