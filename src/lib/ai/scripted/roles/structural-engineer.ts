import type { RoleTemplate } from "../role-template";

export const structuralEngineer: RoleTemplate = {
  id: "structural-engineer",
  title: "Structural or mechanical engineer",
  level: "degree",
  keywords: [
    "structural engineer", "structural engineering", "structural designer", "civil engineer", "civil engineering",
    "building engineer", "mechanical engineer", "mechanical design", "konetekniikka", "koneinsinööri", "rakennesuunnittelija", "rakennesuunnittelu", "rakennusinsinööri", "statiikka",
  ],
  skills: ["structural-design", "safety-thinking", "technical-explanation", "compliance"],
  cues: {
    "structural-design": ["load path", "bearing", "spans"],
    "safety-thinking": ["demolition", "propping", "temporary works"],
    "technical-explanation": ["sketches", "drawings", "site team"],
  },
  why: {
    "structural-design": "An opening in a load-bearing wall moves its load onto two small areas, and the old wall has to carry it there.",
    "safety-thinking": "In renovation, walls and floors most often fail during demolition, before the new beam is in.",
  },
  lookFor: {
    "structural-design": "Follows every load down to the beam ends and checks the bearing on the old block at both ends.",
    "safety-thinking": "Shows the temporary props and needles that hold the wall before any block is removed.",
    "technical-explanation": "Labels the sketch so a site team can build from it without calling back.",
  },
  constraints: [
    "the drawings of the floor above cannot be found",
    "the steel beam can be delivered only in two pieces",
    "the housing company wants the work done in one week",
    "a heating pipe runs inside the wall at ceiling height",
  ],
  challenge: {
    minutes: 15,
    title: "Sketch how to hold up this wall opening",
    format: "make",
    proofKind: "photo",
    brief:
      "We design renovations for apartment buildings from the 1960s and 1970s. A housing company wants a 2.4 m opening in a wall that carries the floor above. A colleague wrote the design note below. How would you support the opening, before and after the cut? This is a synthetic example.",
    material: {
      kind: "text",
      title: "Design note, flat C 23, opening in wall W4 (synthetic)",
      body: [
        "Building: 1968, 8 floors, concrete slabs on 200 mm block walls",
        "Opening: 2.4 m wide, 2.1 m high, in the middle of wall W4",
        "",
        "Loads: floor slab above, 6.5 kN/m², span 4.2 m, half on W4.",
        "Nothing else stands above the opening.",
        "",
        "Beam: steel HEA 200, 2.6 m long, 100 mm on the block at each end.",
        "Work order: cut the opening, then lift the beam in. No props needed.",
        "",
        "Archive drawing, floor 4: partition wall W4b stands right above the opening.",
      ].join("\n"),
    },
    deliverable: "Sketch the beam, its ends and the temporary props, and photograph the sketch (no people) or describe it in words.",
    flaws: [
      {
        label: "the beam sits 100 mm straight on old block, with no bearing check or padstone",
        cues: ["bearing", "padstone", "100 mm", "spreader", "concrete pad", "crush", "bearing length", "200 mm", "pad"],
      },
      {
        label: "the opening cut before any temporary props",
        cues: ["prop", "props", "needle", "temporary", "shore", "before cutting", "support first", "acrow"],
      },
      {
        label: "partition wall W4b on the floor above, missing from the loads",
        cues: ["w4b", "partition", "floor 4", "wall above", "point load", "line load", "extra load"],
      },
    ],
  },
  taster: {
    title: "Read one line of a work order",
    format: "fix",
    proofKind: "writing",
    brief: "A line from a renovation work order.",
    material: {
      kind: "text",
      title: "Work order",
      body: [
        "Wall between kitchen and hall: load-bearing.",
        "Monday: cut a 1.2 m door opening.",
        "Tuesday: the beam goes in.",
      ].join("\n"),
    },
    deliverable: "What would you change before Monday, and why?",
    flaws: [
      {
        label: "a load-bearing wall cut a day before the beam goes in, with nothing holding it up",
        cues: ["prop", "temporary", "support", "same day", "before cutting", "needle", "beam first", "overnight"],
      },
    ],
  },
};
