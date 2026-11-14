import type { RoleTemplate } from "../role-template";

export const automationDeveloper: RoleTemplate = {
  id: "automation-developer",
  title: "AI developer or automation engineer",
  level: "degree",
  keywords: [
    "ai developer", "automation engineer", "automation developer", "ai automation", "process automation",
    "rpa developer", "rpa", "workflow automation", "intelligent automation", "automaatioinsinööri",
    "automaatiokehittäjä", "tekoälykehittäjä",
  ],
  skills: ["automation-choice", "practical-plan", "risk-sense", "writing-clarity", "ai-assisted-work"],
  cues: {
    "automation-choice": ["worth automating", "automating first", "what to build first"],
    "practical-plan": ["small tools", "tools that read"],
    "risk-sense": ["judgement about risk", "person in the loop", "mistake"],
  },
  why: {
    "automation-choice": "We can automate one thing well at a time. The first one should save the most for the least risk.",
    "practical-plan": "We want something working in two weeks, not a project for next year.",
    "risk-sense": "An automation repeats a mistake many times before anyone notices.",
    "writing-clarity": "Our managing director reads your answer between two meetings.",
  },
  lookFor: {
    "automation-choice": "Weighs how often each task happens, how long it takes and what a mistake costs, then picks one and says why.",
    "practical-plan": "Gives steps a small team could start on Monday, with a first version that people use in the second week.",
    "risk-sense": "Names what could go wrong and how it is caught early, such as a person approving the first weeks.",
    "writing-clarity": "Says the choice in the first sentence and keeps the rest short.",
  },
  constraints: [
    "the delivery notes come as phone photos, not paper",
    "only one developer has time for this",
    "the managing director wants the chatbot first",
    "the accounting system has no way to import data",
  ],
  challenge: {
    minutes: 10,
    title: "What should we automate first?",
    format: "make",
    proofKind: "writing",
    brief:
      "We sell spare parts for heat pumps to installers. We are 45 people. Installers order by email and phone, about 120 orders a day. Three people answer about 400 support emails a week, and most ask where an order is. Two people type about 900 invoices a month by hand from delivery notes. Every Monday our sales lead spends 4 hours on a sales report in a spreadsheet. Pick ONE thing to automate first. Say why this one, how you would build it in two weeks, and what could go wrong. This is a synthetic company.",
    material: {
      kind: "text",
      title: "How the work is done today (synthetic)",
      body: [
        "Work               How much          Time today                Notes",
        "Support emails     400 a week        3 people, most of a day   Most ask \"where is my order?\"",
        "Invoices           900 a month       about 2 minutes each      Typed from delivery notes. About 1 in 50 has a typo.",
        "Sales report       1 a week          4 hours                   Data from 3 systems. Product names differ.",
        "Orders             120 a day         email and phone           Entered into the order system by hand.",
      ].join("\n"),
    },
    deliverable: "Write 5 to 8 sentences, then think aloud for one minute.",
    flaws: [
      {
        label: "the support chatbot, which looks exciting but is not the safest first step",
        cues: ["chatbot", "support", "emails", "where is my order", "customers", "tracking"],
      },
      {
        label: "the invoices: many, rule-based and easy to check",
        cues: ["invoice", "invoices", "900", "typed", "delivery notes", "typo", "1 in 50", "rules", "by hand"],
      },
      {
        label: "the weekly report: small, but the data is messy",
        cues: ["report", "4 hours", "spreadsheet", "product names", "three systems", "3 systems", "messy"],
      },
    ],
  },
  taster: {
    title: "Which task would you automate?",
    format: "choose",
    proofKind: "writing",
    brief: "A small office has time to automate one task this month.",
    material: {
      kind: "text",
      title: "Two tasks",
      body: "Both take about the same time each week.",
    },
    options: [
      { id: "a", title: "Task A", body: "Copy 200 order numbers a week from emails into a spreadsheet." },
      { id: "b", title: "Task B", body: "Write a thank-you letter to the one big customer each month." },
    ],
    deliverable: "Which task would you automate first, and why?",
    flaws: [
      {
        label: "a task that repeats many times by the same rule",
        cues: ["200", "repeat", "same", "rule", "copy", "every week", "many"],
      },
    ],
  },
};
