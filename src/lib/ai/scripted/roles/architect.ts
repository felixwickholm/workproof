import type { RoleTemplate } from "../role-template";

export const architect: RoleTemplate = {
  id: "architect",
  title: "Architect",
  level: "degree",
  keywords: [
    "architect", "building architect", "interior architect", "landscape architect", "urban planner",
    "building design", "arkkitehti", "sisustusarkkitehti", "maisema-arkkitehti", "kaavoittaja", "rakennussuunnittelija",
  ],
  skills: ["accessibility", "user-research", "compliance", "planning"],
  cues: {
    accessibility: ["step-free", "ramps", "wheelchair"],
    compliance: ["building code", "fire exits"],
    planning: ["floor plans", "site plans"],
  },
  why: {
    accessibility: "A step at the entrance decides who can use a building at all.",
    "user-research": "An entrance is used by people with prams, walkers and deliveries, and each needs something different.",
  },
  lookFor: {
    accessibility: "Gives a step-free route from the street to the door, with the turning space a wheelchair needs.",
    "user-research": "Starts from who uses the entrance and when, and lets that shape the design.",
    compliance: "Checks the change against the access rules and the fire exit, and says which one limits the design.",
  },
  constraints: [
    "the ramp may not cross the pavement",
    "the budget allows no change to the door frame",
    "the health centre stays open during the works",
    "the city asks for a ramp under a roof",
  ],
  challenge: {
    title: "Mark up this clinic entrance for step-free access",
    format: "build",
    proofKind: "design",
    brief:
      "A health centre in a 1970s building wants a step-free main entrance. An AI tool drafted the change below from the old drawings. Sketch or mark up the entrance as you would change it. This is a synthetic example.",
    material: {
      kind: "text",
      title: "Main entrance, existing and AI-drafted change (synthetic)",
      body: [
        "Existing",
        "- Pavement to door: 3 steps, total rise 450 mm",
        "- Door: double, two 700 mm leaves, opens outwards",
        "- Landing in front of the door: 1.2 m x 1.2 m",
        "- Space between the building and the pavement: 6.5 m",
        "",
        "AI-drafted change",
        "- Ramp straight from the pavement to the door, 3.0 m long",
        "- Keep the existing door and landing",
        "- Handrail on one side",
        "",
        "Use",
        "- About 400 visitors a day, many older people and parents with prams",
        "- The entrance is also the fire exit for the second floor",
        "",
        "The city's guidance: ramps 1:20 where possible, at most 1:12 for",
        "short ramps, a level landing at least every 6 m",
      ].join("\n"),
    },
    deliverable:
      "Sketch or mark up the entrance with your change: ramp, landings and door. Photograph a hand sketch or upload a design. Or describe it in words or by voice. Tell us what you changed from the draft and why.",
    flaws: [
      {
        label: "a 3.0 m ramp for a 450 mm rise, much steeper than 1:12",
        cues: ["steep", "1:12", "1:20", "slope", "5.4", "9 m", "longer", "gradient", "450"],
      },
      {
        label: "a 700 mm door leaf and a 1.2 m landing, too small to open the door and turn a wheelchair",
        cues: ["700", "door", "landing", "turn", "1.5", "automatic", "opener", "wheelchair", "width"],
      },
      {
        label: "the fire exit route changed without checking it still works",
        cues: ["fire", "exit", "escape", "evacuation", "second floor", "outwards"],
      },
    ],
  },
  taster: {
    title: "Read one access note",
    format: "review",
    proofKind: "writing",
    brief: "A note on a building entrance.",
    material: {
      kind: "text",
      title: "Access note",
      body: [
        "Entrance: 2 steps, total rise 300 mm.",
        "Plan: a 1.5 m ramp next to the steps.",
        "The door stays as it is.",
      ].join("\n"),
    },
    deliverable: "What would you change in this plan, and why?",
    flaws: [
      {
        label: "a ramp much too steep for its rise",
        cues: ["steep", "slope", "1:12", "1:20", "longer", "3.6", "6 m", "gradient", "1.5 m"],
      },
    ],
  },
};
