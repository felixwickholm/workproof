import type { RoleTemplate } from "../role-template";

export const structuralEngineer: RoleTemplate = {
  id: "structural-engineer",
  title: "Structural engineer",
  level: "degree",
  keywords: [
    "structural engineer", "structural engineering", "structural designer", "civil engineer", "civil engineering",
    "building engineer", "rakennesuunnittelija", "rakennesuunnittelu", "rakennusinsinööri", "statiikka",
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
    title: "Sketch how you would support an opening in a load-bearing wall",
    format: "build",
    proofKind: "photo",
    brief:
      "A housing company in a 1968 concrete block building wants a 2.4 m opening between a kitchen and a living room. The wall is load-bearing. A colleague used an AI assistant to write the design note below. Before it goes to the contractor, sketch by hand how you would support the opening. This is a synthetic example.",
    material: {
      kind: "text",
      title: "Design note, flat C 23, opening in wall W4 (synthetic)",
      body: [
        "Building: 1968, 8 floors, precast concrete slabs on block walls",
        "Wall W4: 200 mm concrete block, load-bearing. Flat C 23 is on floor 3.",
        "Opening: 2.4 m wide, 2.1 m high, in the middle of the wall",
        "",
        "Loads (AI draft)",
        "- Floor slab above: 6.5 kN/m², span 4.2 m, half of it on W4",
        "- Nothing else stands above the opening.",
        "",
        "Proposed support",
        "- Steel beam HEA 200, length 2.6 m",
        "- Bearing: 100 mm at each end, straight on the block",
        "",
        "Work order (AI draft)",
        "- Cut the opening, then lift the beam in and grout it.",
        "- No temporary support needed for a 2.4 m opening.",
        "",
        "From the archive drawing of floor 4:",
        "- partition wall W4b stands on the slab right above the opening.",
      ].join("\n"),
    },
    deliverable:
      "Sketch by hand the beam, its ends and the temporary support during the works, with the loads you count. Photograph the sketch. Not of people. Or describe it in words or by voice. Tell us what you changed in the note and why.",
    flaws: [
      {
        label: "the beam sits 100 mm straight on old block, with no bearing check or padstone",
        cues: ["bearing", "padstone", "100 mm", "spreader", "concrete pad", "crush", "bearing length", "200 mm", "pad"],
      },
      {
        label: "the opening cut before any temporary propping",
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
    format: "review",
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
