import type { RoleTemplate } from "../role-template";

export const productManager: RoleTemplate = {
  id: "product-manager",
  title: "Product manager",
  level: "degree",
  keywords: [
    "product manager", "product owner", "product management", "pm", "po", "roadmap",
    "product lead", "tuotepäällikkö", "tuoteomistaja", "tuotekehitys", "founder", "startup founder", "entrepreneur", "yrittäjä",
  ],
  skills: ["prioritisation", "user-research", "stakeholder-communication", "metrics-definition", "ai-assisted-work"],
  why: {
    prioritisation: "The list is bigger than the time. What ships first decides what users get this month.",
    "user-research": "Some items come from users with a real problem, some from one loud voice.",
    "stakeholder-communication": "Everyone whose item waits needs to hear why, in one sentence.",
  },
  lookFor: {
    prioritisation: "Fits the cut into the days there are and puts the user problems first.",
    "user-research": "Tells apart the items users asked for from the items nobody outside the team asked for.",
    "stakeholder-communication": "Gives one plain sentence for each item that waits.",
    "metrics-definition": "Says how the team will know next month that the cut was right.",
  },
  constraints: [
    "one developer is ill for three days",
    "the biggest customer asks for offline mode this week",
    "the sales team already promised the export",
    "you can call two warehouse leads before Friday",
  ],
  challenge: {
    minutes: 10,
    title: "Cut this feature list to two weeks of work",
    format: "make",
    proofKind: "plan",
    brief:
      "We build an app that warehouse staff use to watch and restart our pick robots. Two developers have 16 working days in the next two weeks. The list below needs 27. Which features ship in the next two weeks? This is a synthetic example.",
    material: {
      kind: "text",
      title: "Feature list for the next release (synthetic)",
      body: [
        "Feature                                   Days   Who asked",
        "1. Fix: a robot shows twice after restart   4    9 support tickets last month",
        "2. Export the daily pick log to Excel       3    all 3 pilot warehouses",
        "3. Offline mode                             5    1 pilot warehouse with weak signal, from 1 March",
        "4. Dark mode                                4    1 developer",
        "5. Push alert when a robot stops            6    2 warehouse leads, \"nice to have\"",
        "6. New start-up animation                   3    marketing",
        "7. Lead can pause all robots at once        2    2 pilot warehouses",
        "Total                                      27",
      ].join("\n"),
    },
    deliverable: "List what ships and what waits, with one sentence why for each.",
    flaws: [
      {
        label: "the fix and the items pilot warehouses asked for, which fit in the 16 days",
        cues: ["fix", "twice", "tickets", "export", "pause", "pilot", "16", "14", "fits"],
      },
      {
        label: "items nobody outside the team asked for, which can wait",
        cues: ["dark mode", "animation", "marketing", "developer", "nobody", "wait", "later"],
      },
    ],
  },
  taster: {
    title: "One feature or the other?",
    format: "choose",
    proofKind: "writing",
    brief: "There is time for one change this week (synthetic).",
    material: {
      kind: "text",
      title: "Two requests",
      body: "Both take two days.",
    },
    options: [
      { id: "a", title: "Feature A", body: "A new colour theme. Asked by the design team." },
      { id: "b", title: "Feature B", body: "Fix a login error. Twelve users wrote to support about it." },
    ],
    deliverable: "Which one would you ship this week, and why?",
    flaws: [
      {
        label: "a fix that users wrote in about",
        cues: ["login", "error", "fix", "twelve", "12", "users", "support"],
      },
    ],
  },
};
