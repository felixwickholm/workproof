import type { RoleTemplate } from "../role-template";

export const solutionsEngineer: RoleTemplate = {
  id: "solutions-engineer",
  title: "Solutions and sales engineer",
  level: "degree",
  keywords: [
    "solutions engineer", "sales engineer", "pre-sales", "presales", "technical sales",
    "customer engineer", "technical account manager", "ratkaisumyynti", "ratkaisumyyjä", "myyntiinsinööri",
    "tekninen myynti",
  ],
  skills: ["customer-discovery", "technical-explanation", "stakeholder-communication", "ai-assisted-work"],
  why: {
    "customer-discovery": "A customer who gets a promise we cannot keep becomes a support case, not a reference.",
    "technical-explanation": "The customer's IT lead decides from what they understand in this email.",
  },
  lookFor: {
    "customer-discovery": "Notices which customer question was not answered, and asks before promising.",
    "technical-explanation": "Explains the real limit in plain words and offers a next step the team can deliver.",
  },
  constraints: [
    "the customer's IT lead had already said no to cloud hosting",
    "the deal had to close before the end of the quarter",
    "the product team could not commit to new features this year",
    "the reply had to fit on a phone screen",
  ],
  challenge: {
    title: "Review an AI-drafted customer reply",
    format: "review",
    proofKind: "writing",
    brief:
      "A city water utility is evaluating our leak detection platform. Their IT lead sent two questions. A teammate asked an AI assistant to draft the reply below. It goes out tomorrow morning. Today our platform supports only cloud hosting in the EU, and the SCADA connector is on next year's roadmap.",
    material: {
      kind: "text",
      title: "Draft reply",
      body: [
        "Subject: Re: Hosting and SCADA questions",
        "",
        "Hi Anna,",
        "",
        "Thank you for your questions. Our platform is trusted by utilities across Europe",
        "and is built on a modern, secure, cloud-native architecture.",
        "",
        "Integration with your SCADA system is straightforward. Our team will have a",
        "connector ready within two weeks of signing.",
        "",
        "We are confident the platform will reduce your water losses by at least 30%",
        "in the first year.",
        "",
        "Shall we schedule the contract review for next week?",
        "",
        "Kind regards,",
        "The customer team",
      ].join("\n"),
    },
    deliverable:
      "What would you change before this goes out, and why? List the changes in order of importance.",
    flaws: [
      {
        label: "the hosting question left unanswered",
        cues: ["hosting", "on-premise", "on premise", "cloud only", "did not answer", "does not answer", "not answered", "eu", "where the data"],
      },
      {
        label: "the promised two-week SCADA connector that does not exist",
        cues: ["scada", "connector", "two weeks", "2 weeks", "roadmap", "overpromis", "promise", "not available", "next year"],
      },
      {
        label: "the guaranteed 30% loss reduction with no basis",
        cues: ["30%", "guarantee", "reduce your water losses", "evidence", "pilot", "baseline", "claim", "confident"],
      },
    ],
  },
  taster: {
    title: "Spot the problem in a sales reply",
    format: "review",
    proofKind: "writing",
    brief: "A customer asked: \"Can your system export data to Excel?\" An AI assistant drafted this answer.",
    material: {
      kind: "text",
      title: "Draft answer",
      body: [
        "Great question. Our platform has a powerful, flexible data layer",
        "and an open architecture that integrates with many tools.",
        "Let us set up a call to discuss your needs.",
      ].join("\n"),
    },
    deliverable: "What would you change in this answer, and why?",
    flaws: [
      {
        label: "a reply that never answers the yes or no question",
        cues: ["answer the question", "does not answer", "yes or no", "excel", "csv", "export", "directly", "vague"],
      },
    ],
  },
};
