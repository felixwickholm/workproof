import type { RoleTemplate } from "../role-template";

export const lawyer: RoleTemplate = {
  id: "lawyer",
  title: "Legal or compliance specialist",
  level: "degree",
  keywords: [
    "lawyer", "legal counsel", "corporate lawyer", "in-house counsel", "attorney", "solicitor", "legal advisor",
    "contract manager", "paralegal", "compliance specialist", "compliance officer", "legal specialist", "juristi", "lakimies", "asianajaja", "varatuomari", "oikeustieteen",
  ],
  skills: ["contract-review", "compliance", "risk-management", "writing-clarity", "stakeholder-communication"],
  cues: {
    compliance: ["terms and conditions", "data protection"],
    "risk-management": ["clauses"],
  },
  why: {
    "contract-review": "The business owner signs on Friday and reads only the clauses we point to.",
    compliance: "A contract that breaks data protection rules is a risk for us, whatever it says.",
    "risk-management": "Some clauses look normal and are fine. The skill is to find the one that is not.",
  },
  lookFor: {
    "contract-review": "Finds the one clause that puts us at risk and leaves the normal ones alone.",
    compliance: "Names the rule that applies and the smallest change that meets it.",
    "risk-management": "Says what could happen to us if the clause stays as it is.",
    "writing-clarity": "Writes the fixed clause so the business owner understands it without a lawyer in the room.",
  },
  constraints: [
    "the supplier refuses any change to that clause",
    "the contract must be signed this week",
    "the business owner reads only the first five lines of your note",
    "the supplier is based outside the EU",
  ],
  challenge: {
    minutes: 10,
    title: "One clause puts us at risk. Find it",
    format: "fix",
    proofKind: "writing",
    brief:
      "We run payments software, and we are buying an identity check service that will handle our customers' personal data. Most of the contract is normal. Which clause puts us at risk, and how would you fix it? This is a synthetic example.",
    material: {
      kind: "text",
      title: "Supplier contract, identity check service, short version (synthetic)",
      body: [
        "2.1 Term: 24 months. Renews for 12 months unless cancelled 3 months before the end.",
        "4.1 Price: 0.08 EUR per check, billed monthly. Fixed for the first 24 months.",
        "5.2 Service level: 99.5% a month. A 5% credit for each 0.5% missed.",
        "7.1 Liability: each party's liability is capped at the fees of the last 12 months,",
        "    except for breaches of data protection or confidentiality.",
        "8.4 Personal data: the supplier may process customer personal data in any country",
        "    and may use subprocessors without telling the customer.",
        "9.1 Termination: either party may end the contract with 30 days' notice",
        "    after a serious breach that is not fixed.",
        "11.2 Law: Finnish law. Disputes in the Helsinki District Court.",
      ].join("\n"),
    },
    deliverable: "Name the risky clause, say what could happen, and write the fixed clause.",
    flaws: [
      {
        label: "personal data processed in any country by unnamed subprocessors",
        cues: ["8.4", "personal data", "any country", "subprocessor", "gdpr", "outside the eu", "transfer", "dpa", "data processing"],
      },
      {
        label: "the renewal clause, which is normal and needs no change",
        cues: ["2.1", "renew", "renewal", "3 months", "notice"],
      },
    ],
  },
  taster: {
    title: "Read one contract clause",
    format: "fix",
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
