import type { RoleTemplate } from "../role-template";

export const productManager: RoleTemplate = {
  id: "product-manager",
  title: "Product manager",
  keywords: [
    "product manager", "product owner", "product management", "pm", "po", "roadmap",
    "product lead", "tuotepäällikkö", "tuoteomistaja", "tuotekehitys",
  ],
  skills: ["prioritisation", "metrics-definition", "user-research", "stakeholder-communication", "ai-assisted-work"],
  why: {
    prioritisation: "The team can build one of these features this quarter, not all three.",
    "metrics-definition": "If the success measure is vague, nobody can tell whether the feature worked.",
  },
  lookFor: {
    prioritisation: "Says which item to cut or delay and ties the choice to evidence about users.",
    "user-research": "Separates what the evidence shows from what the draft assumes about users.",
  },
  constraints: [
    "engineering capacity drops by half this quarter",
    "the sales team has already promised the export feature to a customer",
    "you could talk to five users before Friday",
    "the support team owns the success measure",
  ],
  challenge: {
    title: "Review an AI-drafted product requirements excerpt",
    format: "review",
    brief:
      "We make a shift planning app for small clinics. Our PM asked an AI assistant to turn last month's feedback into requirements for Q1. The draft goes to engineering on Thursday. Before it does, we would like someone to read it the way the team will.",
    material: {
      kind: "text",
      title: "Q1 requirements draft: shift swaps",
      body: [
        "Problem",
        "Staff ask for an easier way to swap shifts. Feedback mentions swaps 41 times in October.",
        "",
        "Evidence",
        "- 41 mentions of swaps in the feedback form (38 from one clinic)",
        "- Managers say approving swaps takes too long",
        "",
        "Scope for Q1 (all must ship)",
        "1. Swap marketplace: staff post a shift, colleagues claim it",
        "2. Automatic approval when both people have the same role",
        "3. Payroll export of swapped hours",
        "4. Push notifications for every new swap post",
        "",
        "Success measure",
        "Users love the new swap experience.",
        "",
        "Out of scope",
        "Changes to how managers see the rota.",
        "",
        "Timeline",
        "Design in week 1, build in weeks 2 to 6, release in week 7.",
      ].join("\n"),
    },
    deliverable:
      "What would you change before this goes to engineering, and why? List the changes in order of importance.",
    flaws: [
      {
        label: "the evidence that comes almost entirely from one clinic",
        cues: ["one clinic", "38", "single clinic", "skewed", "sample", "representative", "same clinic"],
      },
      {
        label: "the success measure that cannot be counted",
        cues: ["love", "success measure", "measurable", "metric", "baseline", "how will we know", "time to approve"],
      },
      {
        label: "four items marked as must ship with no priority between them",
        cues: ["all must ship", "must ship", "scope", "cut", "too much", "priorit", "mvp", "first release", "payroll"],
      },
    ],
  },
  taster: {
    title: "Read one line of a product goal",
    format: "review",
    brief: "An AI assistant wrote this goal for a new onboarding flow.",
    material: {
      kind: "text",
      title: "Onboarding goal",
      body: [
        "Goal: increase sign-ups by 30% in Q1.",
        "Plan: remove the email confirmation step.",
        "Owner: growth team.",
      ].join("\n"),
    },
    deliverable: "What is the one question you would ask before agreeing to this plan?",
    flaws: [
      {
        label: "a sign-up goal that ignores whether new users stay active",
        cues: ["active", "retention", "fake", "spam", "quality", "confirm", "real users", "bots", "activation"],
      },
    ],
  },
};
