import type { RoleTemplate } from "../role-template";

export const customerServiceAgent: RoleTemplate = {
  id: "customer-service",
  title: "Customer service agent",
  level: "practice",
  keywords: [
    "customer service", "customer support", "customer service agent", "support agent", "asiakaspalvelu",
    "asiakaspalvelija", "call centre", "call center", "contact centre", "helpdesk", "receptionist",
    "vastaanotto", "puhelinpalvelu",
  ],
  skills: ["calm-on-the-phone", "serving-customers", "plain-language", "stakeholder-communication"],
  cues: {
    "calm-on-the-phone": ["angry", "callers", "complaints", "difficult calls"],
    "plain-language": ["bills", "explains", "simply", "plain words"],
  },
  why: {
    "calm-on-the-phone": "The caller is angry about money. The first half minute decides whether the call can be solved.",
    "serving-customers": "A customer who threatens to leave usually wants the problem fixed, not a discount.",
  },
  lookFor: {
    "calm-on-the-phone": "Acknowledges the double bill in plain words before explaining anything, and keeps the tone steady.",
    "serving-customers": "Says what will happen to the money and when, and promises only what the agent can do.",
    "plain-language": "Avoids billing terms the caller would not use, such as invoice period or credit note, or explains them.",
  },
  constraints: [
    "the billing team cannot be reached until tomorrow",
    "the caller speaks only a little Finnish and a little English",
    "the queue has twelve people waiting",
    "the system shows a third bill being prepared",
  ],
  challenge: {
    title: "A customer got two bills. Say your first 30 seconds",
    format: "explain",
    proofKind: "voice",
    brief:
      "You answer the billing line at an energy company. The next caller is upset: two electricity bills for October arrived, and one has already been taken from the bank account. Below is what your screen shows when the call connects. This is a synthetic example.",
    material: {
      kind: "text",
      title: "Account view at call start (synthetic)",
      body: [
        "Customer: private, contract since 2019",
        "Address: moved to a new flat on 1 October",
        "",
        "Contract events",
        "- 28 Sep: move date entered by web form, 1 Oct",
        "- 30 Sep: move date entered again by phone, 1 Oct",
        "  (two contracts created for the new address)",
        "",
        "Bills for October",
        "- Bill A: 64.20 EUR, direct debit, paid 14 Nov",
        "- Bill B: 64.20 EUR, due 21 Nov, open",
        "",
        "Note from the previous call (12 Nov): customer said",
        "\"I will cancel the whole contract if this happens again.\"",
        "",
        "Allowed for agents: cancel an open bill, request a refund",
        "(paid within 10 working days by the billing team)",
        "Not allowed for agents: refunds paid today, discounts",
      ].join("\n"),
    },
    deliverable:
      "Record your first 30 seconds of the call, as you would say it. Only the words are kept, never your voice. Or write it.",
    flaws: [
      {
        label: "the paid bill needs a refund or credit, and the open bill can simply be cancelled",
        cues: ["refund", "credit", "cancel", "open bill", "bill b", "money back", "hyvitys", "palautus", "takaisin"],
      },
      {
        label: "the double contract created by entering the move twice",
        cues: ["twice", "two contracts", "duplicate", "double", "move date", "kahdesti", "kaksi sopimusta", "our mistake", "our error"],
      },
      {
        label: "a promise of money today, which the agent is not allowed to make",
        cues: ["today", "10 working days", "ten working days", "promise", "cannot", "billing team", "discount", "within"],
      },
    ],
  },
  taster: {
    title: "Answer one upset caller",
    format: "explain",
    proofKind: "voice",
    brief: "A caller to an energy company says this, word for word.",
    material: {
      kind: "text",
      title: "Caller",
      body: [
        "\"This is the third time I call.",
        "Every time someone says it is fixed.",
        "It is not fixed.\"",
      ].join("\n"),
    },
    deliverable: "Say it or write it: what is the first sentence you would say, and why that one?",
    flaws: [
      {
        label: "a caller who needs to hear that the earlier calls were heard before any new promise",
        cues: ["sorry", "third", "heard", "understand", "before", "promise", "check", "notes", "myself", "stay"],
      },
    ],
  },
};
