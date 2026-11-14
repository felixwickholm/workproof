import type { RoleTemplate } from "../role-template";

export const accountant: RoleTemplate = {
  id: "accountant",
  title: "Accountant",
  level: "degree",
  keywords: [
    "accountant", "accounting", "bookkeeper", "bookkeeping", "financial controller", "payroll",
    "kirjanpitäjä", "kirjanpito", "taloushallinto", "tilitoimisto", "controller",
  ],
  skills: ["bookkeeping-accuracy", "compliance", "ai-assisted-work", "stakeholder-communication"],
  why: {
    "bookkeeping-accuracy": "These entries feed the VAT return due on the 12th.",
    compliance: "A wrong VAT treatment means a correction, interest and a harder audit.",
  },
  lookFor: {
    "bookkeeping-accuracy": "Finds the entries that are wrong and states the correct booking.",
    compliance: "Names the rule behind each correction in plain words.",
  },
  constraints: [
    "the VAT return is due tomorrow morning",
    "the client cannot find the original invoice for the laptop",
    "the client is moving to a new accounting system next month",
    "you had to explain the corrections to the client by phone",
  ],
  challenge: {
    minutes: 15,
    title: "Review AI-prepared journal entries",
    format: "fix",
    proofKind: "writing",
    brief:
      "We keep the books for a small design studio in Finland. An AI tool suggested the October entries below from the bank feed and receipts. They go into the VAT return this week. Please check them before we post.",
    material: {
      kind: "text",
      title: "October journal entries (amounts in EUR)",
      body: [
        "Date   Description                     Account              Debit    Credit   VAT",
        "03.10  Office rent, October             Rent expense         1 800             0%",
        "05.10  Laptop for designer              Office supplies      2 480             25.5%",
        "09.10  Client invoice 1043 paid         Bank                 6 200",
        "09.10  Client invoice 1043 paid         Sales                         6 200    25.5%",
        "14.10  Software subscription (EU)       IT expenses            120             0%",
        "21.10  Team lunch with client           Representation         310             25.5%",
        "28.10  Owner withdrawal                 Office supplies        500             25.5%",
        "",
        "Notes from the tool",
        "- Invoice 1043 was already booked as a sale when it was issued on 15.09.",
        "- The EU software seller did not charge VAT (reverse charge).",
      ].join("\n"),
    },
    deliverable:
      "What would you change before these entries are posted, and why? Give the correct booking for each change.",
    flaws: [
      {
        label: "the payment of invoice 1043 booked as a second sale",
        cues: ["1043", "twice", "double", "already booked", "receivable", "accounts receivable", "second sale", "duplicate"],
      },
      {
        label: "the owner withdrawal booked as an office expense with VAT",
        cues: ["owner withdrawal", "withdrawal", "equity", "private", "not an expense", "drawings"],
      },
      {
        label: "VAT deducted on representation and missing reverse charge on the EU purchase",
        cues: ["representation", "not deductible", "non-deductible", "reverse charge", "self-assess", "eu purchase", "lunch"],
      },
    ],
  },
  taster: {
    title: "Check one entry",
    format: "fix",
    proofKind: "writing",
    brief: "An AI tool booked this purchase from a receipt.",
    material: {
      kind: "text",
      title: "Entry",
      body: [
        "12.11  Laptop, 2 400 EUR + VAT",
        "Account: Office supplies (expense)",
        "Company policy: items over 1 200 EUR are fixed assets.",
      ].join("\n"),
    },
    deliverable: "What would you change, and why?",
    flaws: [
      {
        label: "a fixed asset booked as an expense",
        cues: ["fixed asset", "asset", "capitalis", "capitaliz", "depreciat", "1 200", "policy"],
      },
    ],
  },
};
