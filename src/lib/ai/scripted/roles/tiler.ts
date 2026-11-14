import type { RoleTemplate } from "../role-template";

export const renovationWorker: RoleTemplate = {
  id: "renovation-worker",
  title: "Tiler and renovation worker",
  level: "practice",
  keywords: [
    "tiler", "tiling", "renovation", "renovation worker", "construction worker", "builder", "painter",
    "plasterer", "carpenter", "bathroom renovation", "laatoittaja", "laatoitus", "remontti", "rakennus",
    "rakennusmies", "kirvesmies", "maalari", "remonttimies",
  ],
  skills: ["surface-preparation", "work-safety", "showing-the-work", "planning"],
  why: {
    "surface-preparation": "Tiles on a wet or uneven wall crack or come loose, and the leak shows up a year later.",
    "showing-the-work": "A short clip of the checks says more than a list of past sites.",
  },
  lookFor: {
    "surface-preparation": "Checks flatness, moisture and drying times before tiling, and says what would stop the work.",
    planning: "Fits the drying times into the day without skipping a step to keep the date.",
  },
  constraints: [
    "the client wants the bathroom ready two days earlier",
    "the moisture meter is left at another site",
    "the membrane supplier delivers a different product",
    "the flat below reports a damp ceiling",
  ],
  challenge: {
    minutes: 15,
    title: "Show how you check a wall before tiling",
    format: "make",
    proofKind: "video",
    brief:
      "We are renovating a bathroom in a 1970s apartment building. The team lead left the site note below and wants tiling to start tomorrow at 7:00. Before anyone tiles, we would like to see how you check the wall and the floor. This is a synthetic example.",
    material: {
      kind: "text",
      title: "Site note, flat B 14, bathroom (synthetic)",
      body: [
        "Walls: old tiles removed, cement board on the shower wall.",
        "Flatness: checked by eye, looks fine.",
        "",
        "Waterproofing",
        "- Primer on Monday 16:00.",
        "- Membrane, first coat Tuesday 8:00, second coat Tuesday 12:00.",
        "- Product sheet: 4 h between coats, 24 h before tiling.",
        "",
        "Floor",
        "- New screed poured last Friday.",
        "- Slope to the drain: not measured yet.",
        "",
        "Moisture",
        "- Reading on Monday morning, before primer: 92% RH.",
        "",
        "Plan: tiling starts Wednesday 7:00.",
      ].join("\n"),
    },
    deliverable:
      "Film your hands and the wall, not your face. 30 seconds. Or describe it in words or by voice. Show or tell us what you check, in what order, and what would make you stop.",
    flaws: [
      {
        label: "flatness checked by eye instead of with a level",
        cues: ["level", "flat", "by eye", "straight", "dip", "bump", "spirit level", "two-metre"],
      },
      {
        label: "tiling planned before the membrane and the screed have dried, on a reading taken before primer",
        cues: ["moisture", "dry", "drying", "92", "screed", "24 h", "membrane", "wait", "meter", "humidity"],
      },
      {
        label: "the floor slope to the drain never measured",
        cues: ["slope", "drain", "fall", "water runs", "measure", "gradient"],
      },
    ],
  },
  taster: {
    title: "Read one site note",
    format: "fix",
    proofKind: "writing",
    brief: "This note was left for the morning shift.",
    material: {
      kind: "text",
      title: "Site note",
      body: [
        "Shower wall: membrane done at 18:00 yesterday.",
        "Product sheet: tile after 24 h.",
        "Morning shift: start tiling at 7:00.",
      ].join("\n"),
    },
    deliverable: "Tell us in words or by voice: what would you do at 7:00, and why?",
    flaws: [
      {
        label: "tiling planned before the membrane has dried",
        cues: ["24", "dry", "wait", "membrane", "18:00", "too early", "not yet", "other wall", "afternoon"],
      },
    ],
  },
};
