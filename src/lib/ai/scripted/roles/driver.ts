import type { RoleTemplate } from "../role-template";

export const driver: RoleTemplate = {
  id: "driver",
  title: "Bus and delivery driver",
  level: "practice",
  keywords: [
    "driver", "bus driver", "delivery driver", "van driver", "truck driver", "courier", "taxi", "taxi driver",
    "pilot", "kuljettaja", "bussikuski", "linja-autonkuljettaja", "jakelukuljettaja", "kuski", "lentäjä",
  ],
  skills: ["route-planning", "safety-thinking", "prioritisation", "serving-customers"],
  why: {
    "route-planning": "Time windows, cold goods and breaks all have to fit in one day behind the wheel.",
    "safety-thinking": "A tired driver or a skipped vehicle check puts everyone on the road at risk.",
  },
  lookFor: {
    "route-planning": "Orders the stops by time windows and distance, loads the van in reverse order, and plans the break.",
    "safety-thinking": "Keeps the legal break and the vehicle check in the plan even when the day runs late.",
  },
  constraints: [
    "the bridge on the main road is closed until noon",
    "one customer moves the time window an hour later",
    "the cooling unit in the van starts to fail",
    "a second driver calls in ill and you take two of their stops",
  ],
  challenge: {
    minutes: 15,
    title: "Check an AI-planned delivery route",
    format: "make",
    proofKind: "plan",
    brief:
      "Our route tool planned tomorrow's van route below. The driver starts at the depot at 7:00 and must be back by 15:00. Please check the route before the van is loaded tonight, and change what needs changing. This is a synthetic example.",
    material: {
      kind: "text",
      title: "Route plan, van 3, Thursday (synthetic)",
      body: [
        "Load order (first in, back of van): stops 1, 2, 3, 4, 5, 6",
        "",
        "Stop  Arrive  Customer            Goods                 Time window",
        "1     7:30    Office café         Chilled dairy, 2 box  7:00-9:00",
        "2     8:20    School kitchen      Frozen fish, 6 box    8:00-10:00",
        "3     9:40    Pharmacy            Medicine, 1 box       9:00-12:00",
        "4     11:10   Lunch restaurant    Vegetables, 8 box     before 10:30",
        "5     12:30   Flower shop         Flowers, 4 box        12:00-16:00",
        "6     14:10   Hotel               Linen, 10 bags        13:00-15:00",
        "",
        "Back at depot: 14:50",
        "Breaks: none planned, the day is short.",
        "Cooling unit: set to frozen for the whole van.",
      ].join("\n"),
    },
    deliverable:
      "Write the route you would drive: the stop order, the load order and the break, and say why. Or tell us by voice.",
    flaws: [
      {
        label: "stop 1 loaded first, at the back of the van, so the driver must unload everything to reach it",
        cues: ["load order", "back of the van", "reverse", "last in", "first out", "unload", "reach"],
      },
      {
        label: "the restaurant stop arrives after its time window",
        cues: ["restaurant", "10:30", "11:10", "time window", "late", "earlier", "before"],
      },
      {
        label: "no break and one temperature for chilled, frozen and flowers",
        cues: ["break", "rest", "frozen", "chilled", "temperature", "cooling", "flowers", "dairy"],
      },
    ],
  },
  taster: {
    title: "Check a vehicle before you leave",
    format: "fix",
    proofKind: "writing",
    brief: "The vehicle check before the first trip of the day shows this.",
    material: {
      kind: "text",
      title: "Morning check",
      body: [
        "Tyres: fine.",
        "Lights: fine.",
        "Brake warning light: on, went off after a minute yesterday.",
        "Schedule: leave in five minutes.",
      ].join("\n"),
    },
    deliverable: "Tell us in words or by voice: would you leave on time, and what would you do first?",
    flaws: [
      {
        label: "a brake warning light that came on again before departure",
        cues: ["brake", "warning", "light", "report", "do not leave", "check", "workshop", "supervisor", "call"],
      },
    ],
  },
};
