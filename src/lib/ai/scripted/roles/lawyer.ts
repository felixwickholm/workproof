import type { RoleTemplate } from "../role-template";

export const lawyer: RoleTemplate = {
  id: "lawyer",
  title: "Lawyer",
  level: "degree",
  keywords: [
    "lawyer", "legal counsel", "corporate lawyer", "in-house counsel", "attorney", "solicitor", "legal advisor",
    "contract manager", "paralegal", "juristi", "lakimies", "asianajaja", "varatuomari", "oikeustieteen",
  ],
  skills: ["compliance", "risk-management", "writing-clarity", "stakeholder-communication"],
  cues: {
    compliance: ["contracts", "terms and conditions", "data protection"],
    "risk-management": ["liability", "clauses"],
  },
  why: {
    compliance: "A contract that breaks data protection rules is a risk for both sides, whatever it says.",
    "risk-management": "The clauses people skim, such as liability and renewal, are where the cost appears later.",
  },
  lookFor: {
    compliance: "Names the rule that applies and the smallest change to the clause that meets it.",
    "risk-management": "Finds the clauses that move the most risk to the company and proposes a fair change.",
    "writing-clarity": "Writes the change so the business owner understands it without a lawyer in the room.",
  },
  constraints: [
    "the supplier refuses any change to the liability clause",
    "the contract must be signed by Friday",
    "the business owner reads only the first five lines of your note",
    "the supplier is based outside the EU",
  ],
  challenge: {
    title: "Review an AI summary of a service contract",
    format: "review",
    proofKind: "writing",
    brief:
      "Our company is buying a cloud service that will store our customers' contact details. The supplier sent its standard terms, and our team used an AI assistant to summarise them for the business owner. This is a synthetic example. Please review the summary as the company's lawyer.",
    material: {
      kind: "text",
      title: "Contract summary for the business owner (AI draft, synthetic)",
      body: [
        "Service: cloud customer database, 3-year term, 18,000 EUR a year",
        "",
        "Key terms",
        "- 4.2 Liability: the supplier's total liability is capped at",
        "  one month's fee. Data breaches are included in the cap.",
        "- 6.1 Renewal: renews for 3 more years unless cancelled",
        "  12 months before the end.",
        "- 7.3 Data: the supplier may use customer data to improve its",
        "  services and may use subcontractors without notice.",
        "- 9.1 Law: the law of the supplier's home country applies.",
        "",
        "AI summary for the business owner",
        "\"Standard terms. Nothing unusual. Safe to sign this week.\"",
        "",
        "Not in the contract: a data processing agreement, where",
        "the data is stored, what happens to the data at the end.",
      ].join("\n"),
    },
    deliverable:
      "Write a short note to the business owner: what must change before signing, what is acceptable, and why. Start with the most important point.",
    flaws: [
      {
        label: "personal data processed with no data processing agreement, free reuse and unannounced subcontractors",
        cues: ["gdpr", "data processing", "dpa", "7.3", "subcontractor", "personal data", "processor", "article 28", "where the data"],
      },
      {
        label: "a liability cap of one month's fee that also covers data breaches",
        cues: ["liability", "cap", "4.2", "one month", "breach", "uncapped"],
      },
      {
        label: "an automatic three-year renewal with a 12-month notice period",
        cues: ["renewal", "6.1", "12 months", "notice", "auto", "renew", "calendar"],
      },
    ],
  },
  taster: {
    title: "Read one contract clause",
    format: "review",
    proofKind: "writing",
    brief: "One clause from a supplier's standard terms.",
    material: {
      kind: "text",
      title: "Clause 7.3",
      body: [
        "\"The supplier may use customer data to improve its services",
        "and may appoint subcontractors without notice.\"",
      ].join("\n"),
    },
    deliverable: "What would you ask the supplier to change, and why?",
    flaws: [
      {
        label: "free reuse of customer data and unannounced subcontractors",
        cues: ["personal data", "gdpr", "purpose", "subcontractor", "notice", "processing", "agreement", "consent"],
      },
    ],
  },
};
