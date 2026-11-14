import type { RoleTemplate } from "../role-template";

export const researchScientist: RoleTemplate = {
  id: "research-scientist",
  title: "Research scientist",
  level: "degree",
  keywords: [
    "research scientist", "clinical researcher", "medical researcher", "materials scientist", "battery researcher",
    "postdoc", "postdoctoral researcher", "test validation", "clinical study", "tutkija", "tutkijatohtori",
  ],
  skills: ["scientific-reasoning", "statistical-reasoning", "data-quality", "experiment-design", "writing-clarity"],
  cues: {
    "scientific-reasoning": ["studies", "validation", "claims"],
    "statistical-reasoning": ["result table", "test results"],
  },
  why: {
    "scientific-reasoning": "Customers will read the summary, not the table under it.",
    "statistical-reasoning": "A big number from one group can hide a small one from another.",
    "data-quality": "Two groups made at different times can differ for reasons that have nothing to do with the coating.",
    "experiment-design": "The next test should answer the question this one left open.",
  },
  lookFor: {
    "scientific-reasoning": "Says whether the table supports the claim, and which numbers decide it.",
    "statistical-reasoning": "Works out the gain per group and notices a group too small to say much.",
    "data-quality": "Notices that the two groups came from different batches.",
    "experiment-design": "Proposes the next test that would settle the question.",
    "writing-clarity": "Writes a fairer claim in one or two plain sentences.",
  },
  constraints: [
    "the summary must stay one sentence long",
    "you can test 20 more cells in one group",
    "a customer uses the cells in hot cars",
    "the sales team needs the claim by Friday",
  ],
  challenge: {
    minutes: 10,
    title: "Does this table support the claim?",
    format: "read",
    proofKind: "writing",
    brief:
      "We make coatings that help battery cells last longer. Our lab tested a new coating, and a colleague wrote the claim below for customers. Is the claim supported by the table? This is a synthetic study.",
    material: {
      kind: "text",
      title: "New coating, cycle test (synthetic)",
      body: [
        "Claim: \"Our new coating makes battery cells last 30% longer.\"",
        "",
        "Group      Cells   Temperature   Cycles until 80% capacity (average)",
        "Uncoated     20       25 °C           800",
        "Coated       20       25 °C         1 040   (+30%)",
        "Uncoated      4       45 °C           520",
        "Coated        4       45 °C           540   (+4%)",
        "",
        "Coated cells: new batch, made in October.",
        "Uncoated cells: older batch, made in May.",
        "All tests ran in one lab.",
      ].join("\n"),
    },
    deliverable: "Say whether the table supports the claim, and point to the numbers that decide it.",
    flaws: [
      {
        label: "the gain only shows at 25 °C, and almost nothing at 45 °C",
        cues: ["45", "4%", "540", "520", "heat", "hot", "warm", "25 °c", "only at"],
      },
      {
        label: "four cells per group at 45 °C, too few to say much",
        cues: ["4 cells", "four", "small", "too few", "sample"],
      },
      {
        label: "coated and uncoated cells from different batches",
        cues: ["batch", "october", "may", "different", "older", "newer", "same batch"],
      },
    ],
  },
  taster: {
    title: "Read one study claim",
    format: "read",
    proofKind: "writing",
    brief: "A line from a study summary (synthetic).",
    material: {
      kind: "text",
      title: "Study summary",
      body: [
        "10 people used the new cream for a week.",
        "7 said their skin felt better.",
        "Summary: the cream works.",
      ].join("\n"),
    },
    deliverable: "What would you ask before you believe the summary, and why?",
    flaws: [
      {
        label: "no comparison group, so the change could have happened anyway",
        cues: ["compare", "comparison", "control", "placebo", "anyway", "without the cream", "only 10", "small"],
      },
    ],
  },
};
