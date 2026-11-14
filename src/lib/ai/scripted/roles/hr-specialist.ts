import type { RoleTemplate } from "../role-template";

export const hrSpecialist: RoleTemplate = {
  id: "hr-specialist",
  title: "HR specialist",
  level: "degree",
  keywords: [
    "hr specialist", "hr", "human resources", "hr partner", "hr business partner", "hr manager", "people operations",
    "recruiter", "talent acquisition", "henkilöstöasiantuntija", "henkilöstöpäällikkö", "hr-asiantuntija", "rekrytoija",
  ],
  skills: ["compliance", "plain-language", "stakeholder-communication", "ai-assisted-work"],
  cues: {
    compliance: ["sick leave", "employment law", "health data"],
    "stakeholder-communication": ["managers", "employees", "occupational health"],
  },
  why: {
    compliance: "Health information is the most protected data an employer holds, and one message from a manager can leak it.",
    "plain-language": "Someone coming back from sick leave reads every word for what it means for their job.",
  },
  lookFor: {
    compliance: "Removes health details the team may not see and names the rule behind it.",
    "plain-language": "Rewrites the plan in short sentences that say what happens on the first days back.",
    "stakeholder-communication": "Says who gets which version: the employee, the manager and the team.",
  },
  constraints: [
    "the manager has already sent the draft to the team",
    "the employee asks for the plan in English",
    "occupational health cannot meet before the return date",
    "the team moves to a new office that week",
  ],
  challenge: {
    minutes: 15,
    title: "Review an AI-drafted return-to-work plan",
    format: "fix",
    proofKind: "writing",
    brief:
      "An employee returns after three months of sick leave next Monday. The manager asked an AI assistant to draft a return-to-work plan and a message to the team. HR checks both before they are sent. This is a synthetic example. Please review them as the HR specialist.",
    material: {
      kind: "text",
      title: "Return-to-work plan and team message (AI draft, synthetic)",
      body: [
        "Return-to-work plan",
        "- Role: project coordinator, back on Monday 24.11.",
        "- Reason for leave: burnout and depression (from the doctor's note).",
        "- Weeks 1-2: full days, to catch up quickly.",
        "- Occupational health: not needed, the doctor has signed the return.",
        "- Workload: the same projects as before, plus the Q4 report.",
        "",
        "Message to the team",
        "\"Hi all, our coordinator is back on Monday after burnout and",
        "depression. Please be gentle. The Q4 report moves to the",
        "coordinator so we can catch up.\"",
        "",
        "Company policy (HR handbook)",
        "- After sick leave of over 90 days: a return meeting with",
        "  occupational health, the manager and the employee.",
        "- Shorter days are possible for up to 4 months after a long leave.",
      ].join("\n"),
    },
    deliverable:
      "What would you change in the plan and the team message before they are sent, and why? Start with the most urgent item.",
    flaws: [
      {
        label: "the diagnosis shared with the whole team",
        cues: ["diagnosis", "burnout", "depression", "health", "private", "privacy", "team message", "confidential", "gdpr"],
      },
      {
        label: "the return meeting with occupational health skipped after more than 90 days of leave",
        cues: ["occupational health", "90 days", "meeting", "policy", "return meeting", "työterveys"],
      },
      {
        label: "full days and an extra report from the first week, although shorter days are possible",
        cues: ["full days", "q4", "workload", "shorter", "gradual", "part-time", "fewer hours"],
      },
    ],
  },
  taster: {
    title: "Read one team message",
    format: "fix",
    proofKind: "writing",
    brief: "A manager wants to send this to the team.",
    material: {
      kind: "text",
      title: "Team message",
      body: [
        "\"Our colleague is back on Monday after a heart operation.",
        "Please do not give him heavy work.\"",
      ].join("\n"),
    },
    deliverable: "What would you change before it is sent, and why?",
    flaws: [
      {
        label: "health details shared with the whole team",
        cues: ["health", "operation", "private", "privacy", "diagnosis", "consent", "ask him", "remove"],
      },
    ],
  },
};
