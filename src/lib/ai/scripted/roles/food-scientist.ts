import type { RoleTemplate } from "../role-template";

export const foodScientist: RoleTemplate = {
  id: "food-scientist",
  title: "Food scientist and quality manager",
  level: "degree",
  keywords: [
    "food scientist", "food science", "food technologist", "food technology", "food engineer", "food chemist",
    "quality manager", "food quality", "food safety manager", "elintarviketeknologi", "elintarvike", "laatupäällikkö",
    "elintarvikekemisti", "elintarvikeinsinööri",
  ],
  skills: ["food-safety", "lab-practice", "compliance", "stakeholder-communication"],
  cues: {
    "food-safety": ["allergen control", "changeovers", "production line", "recalls"],
    "lab-practice": ["swab", "positive control", "test kits"],
  },
  why: {
    "food-safety": "An allergen left on a line after a changeover reaches a customer who cannot see it on the label.",
    "lab-practice": "A re-test that repeats the first test's mistake gives a clean result nobody should trust.",
  },
  lookFor: {
    "food-safety": "Holds the product made since the positive swab and decides what happens to it before the line restarts.",
    "lab-practice": "Sets up the re-test with a working control, swabs a dry surface and covers the places cleaning tends to miss.",
    "stakeholder-communication": "Says who hears about the held product first: production, the warehouse and the customer.",
  },
  constraints: [
    "the line is due to restart in 40 minutes",
    "swab kits from a new lot arrive only tomorrow",
    "the customer's auditor visits the plant this week",
    "the night shift has already shipped one pallet",
  ],
  challenge: {
    minutes: 15,
    title: "An allergen swab came back positive on line 2. Set up the re-test",
    format: "make",
    proofKind: "photo",
    brief:
      "We make oat drinks and plant-based desserts. Last night line 2 changed over from a milk dessert to a milk-free oat drink. The allergen swab after cleaning came back positive for milk protein. The shift lead's AI assistant drafted the note below, and the line is meant to restart at 10:00. This is a synthetic example.",
    material: {
      kind: "text",
      title: "Line 2 changeover note, Thursday (synthetic)",
      body: [
        "Changeover 02:00-04:30: milk dessert to oat drink (milk-free)",
        "Cleaning: rinse, caustic, acid, rinse. Done 04:30.",
        "",
        "Allergen swabs, milk protein (lateral flow)",
        "- 05:10 filler nozzle 3: POSITIVE (faint line)",
        "- 05:10 tank outlet valve: negative",
        "- 05:10 conveyor belt: negative",
        "",
        "AI-drafted next steps",
        "- Faint line, probably sanitiser residue. Re-swab nozzle 3 only.",
        "- Re-swab right after the sanitiser spray, while the surface is clean.",
        "- Use the open kits from lot 2207 (positive control failed last week).",
        "- Oat drink production started 06:00 to keep the schedule.",
        "  1,800 cartons packed so far and released to the warehouse.",
        "",
        "Label: oat drink, milk-free. Customer: a school catering company.",
      ].join("\n"),
    },
    deliverable:
      "Photograph your bench set-up for the re-test: swabs, controls and your checklist. Not of people. Or describe it in words or by voice. Tell us what you check first and what happens to the cartons already packed.",
    flaws: [
      {
        label: "1,800 cartons labelled milk-free packed and released after a positive swab",
        cues: ["hold", "1,800", "1800", "released", "cartons", "warehouse", "quarantine", "block", "stop", "recall", "06:00"],
      },
      {
        label: "a re-swab planned on a wet, freshly sanitised surface with kits whose positive control failed",
        cues: ["wet", "dry", "sanitiser", "control", "lot", "2207", "new kit", "kits", "false negative"],
      },
      {
        label: "only the positive nozzle re-swabbed, not the other nozzles and the seals cleaning tends to miss",
        cues: ["only nozzle", "all nozzles", "nozzles", "gasket", "seal", "dismantle", "more sites", "hard to clean"],
      },
    ],
  },
  taster: {
    title: "Read one swab result",
    format: "fix",
    proofKind: "writing",
    brief: "A note from the morning shift at a food plant.",
    material: {
      kind: "text",
      title: "Shift note",
      body: [
        "Swab after cleaning, filler: milk protein positive.",
        "Next product: milk-free oat drink.",
        "Plan: start the line now, re-swab at lunch.",
      ].join("\n"),
    },
    deliverable: "What would you do before the line starts, and why?",
    flaws: [
      {
        label: "a milk-free product started on a line that tested positive for milk",
        cues: ["stop", "hold", "before", "clean again", "re-clean", "re-swab", "wait", "not start", "label"],
      },
    ],
  },
};
