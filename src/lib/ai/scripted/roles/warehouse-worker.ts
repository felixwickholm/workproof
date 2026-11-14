import type { RoleTemplate } from "../role-template";

export const warehouseWorker: RoleTemplate = {
  id: "warehouse-worker",
  title: "Warehouse worker",
  keywords: [
    "warehouse worker", "warehouse work", "warehouse operative", "logistics worker", "order picker", "picker",
    "forklift", "forklift driver", "stock handler", "varastotyöntekijä", "varasto", "keräilijä", "trukinkuljettaja", "trukki", "logistiikka",
  ],
  skills: ["stock-handling", "work-safety", "prioritisation", "planning"],
  why: {
    "stock-handling": "Every order walks past the shelf, so a bad layout costs time on every pick.",
    "work-safety": "Heavy boxes on high shelves are how backs and feet get hurt.",
  },
  lookFor: {
    "stock-handling": "Puts the fast movers closest, keeps heavy goods low, and keeps labels readable.",
    "work-safety": "Names the lifts and reaches that could hurt someone and moves those goods first.",
  },
  constraints: [
    "the forklift is out of use for a week",
    "a new customer doubles the orders for one product",
    "the night shift has no one trained on the high shelves",
    "the shelf labels cannot be printed until Monday",
  ],
  challenge: {
    title: "Re-plan a shelf so the busiest items are closest",
    format: "plan",
    proofKind: "plan",
    brief:
      "Pickers walk too far on our shelf row C, and two people reported sore backs last month. A planning tool suggested the layout below. Please re-plan the row before the night shift moves the stock. This is a synthetic example.",
    material: {
      kind: "text",
      title: "Row C layout suggestion (synthetic)",
      body: [
        "Level 1 is the floor level. Level 4 needs a step ladder.",
        "",
        "Bay  Level  Item                       Picks per day  Weight per box",
        "C1   1      Spare printer labels       2              1 kg",
        "C1   2      Hand soap, 12 pack         140            6 kg",
        "C1   3      Copy paper, 5 reams        95             12 kg",
        "C2   1      Coffee filters             30             2 kg",
        "C2   2      Bin bags, rolls            60             3 kg",
        "C2   4      Dish detergent, 10 l can   110            11 kg",
        "C3   1      Gloves, boxes              45             2 kg",
        "C3   3      Paper towels               80             4 kg",
        "",
        "Rule from the tool: sort alphabetically within each bay.",
        "Aisle note: pallets of returns stored at the end of row C.",
      ].join("\n"),
    },
    deliverable:
      "Write or sketch the new layout, bay and level for each item, and say why. A photo of a hand drawing is fine. Or tell us by voice.",
    flaws: [
      {
        label: "heavy cans placed at ladder height",
        cues: ["detergent", "11 kg", "level 4", "ladder", "heavy", "lift", "back", "low"],
      },
      {
        label: "rarely picked labels in the easiest spot while busy items sit higher",
        cues: ["labels", "picks per day", "busiest", "closest", "fast mov", "hand soap", "waist", "level 2", "alphabet"],
      },
      {
        label: "returns pallets blocking the end of the aisle",
        cues: ["pallet", "returns", "aisle", "block", "end of row", "walkway", "escape"],
      },
    ],
  },
  taster: {
    title: "Check one shelf",
    format: "review",
    proofKind: "writing",
    brief: "This is one shelf in the picking area.",
    material: {
      kind: "text",
      title: "Shelf C2",
      body: [
        "Top shelf: water bottles, 24 pack, picked all day.",
        "Middle shelf: spare cable ties, picked once a week.",
        "Floor: empty.",
      ].join("\n"),
    },
    deliverable: "Tell us in words or by voice: what would you move first, and why?",
    flaws: [
      {
        label: "a heavy, often picked pack on the top shelf",
        cues: ["water", "top", "heavy", "floor", "lower", "down", "back", "lift", "move"],
      },
    ],
  },
};
