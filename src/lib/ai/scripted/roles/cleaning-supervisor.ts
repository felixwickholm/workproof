import type { RoleTemplate } from "../role-template";

export const cleaningSupervisor: RoleTemplate = {
  id: "cleaning-supervisor",
  title: "Cleaning shift supervisor",
  level: "practice",
  keywords: [
    "cleaner", "cleaning", "cleaning supervisor", "cleaning shift supervisor", "facility services", "janitor",
    "housekeeping", "custodian", "siivooja", "siivous", "laitoshuoltaja", "kiinteistönhoitaja", "siivousesimies",
  ],
  skills: ["shift-planning", "prioritisation", "work-safety", "stakeholder-communication"],
  why: {
    "shift-planning": "With one cleaner missing, the night still has to end with the rooms the client needs first ready.",
    "work-safety": "Wet floors, cleaning chemicals and working alone at night are where cleaners get hurt.",
  },
  lookFor: {
    "shift-planning": "Moves floors by what the client needs in the morning and keeps the load possible for the two cleaners left.",
    "work-safety": "Deals with the wet floor and the lone work before anything else, with a concrete step for each.",
    "stakeholder-communication": "Tells the client contact and the cleaners what changes tonight, in a few clear lines.",
  },
  constraints: [
    "the second cleaner can only stay until 21:30",
    "the client asks for floor 6 to be done as well",
    "the floor machine on floor 5 is broken",
    "you can come in yourself for two hours",
  ],
  challenge: {
    title: "One cleaner is ill tonight. Re-plan six floors",
    format: "plan",
    proofKind: "plan",
    brief:
      "You lead tonight's cleaning shift in an office building. The plan below has three cleaners. One just called in ill, so two cleaners do the shift. Nobody else is free tonight. Write a new plan for the shift and say who you tell. This is a synthetic example.",
    material: {
      kind: "text",
      title: "Night plan, office building, 18:00 to 23:00 (synthetic)",
      body: [
        "Cleaners: A, B, C (C is ill tonight)",
        "",
        "Floor 1  Lobby, toilets              A   18:00-19:00",
        "Floor 2  Offices, meeting room 2B    A   19:00-20:30",
        "         Client note: board meeting in 2B at 07:30",
        "Floor 3  Open office                 B   18:00-19:30",
        "Floor 4  Open office, kitchen        B   19:30-21:00",
        "Floor 5  Lab corridor, kitchen       C   18:00-20:00",
        "         Note: coffee machine leaked, floor wet near lift",
        "         Use floor machine and the acid cleaner",
        "Floor 6  Archive, rarely used        C   20:00-22:30",
        "",
        "Building rules",
        "- Alarm is set at 22:00. Last person out hands the key to the guard.",
        "- Acid cleaner: gloves and goggles, never alone on the floor.",
        "- Floor 6 can wait one night if the client is told.",
      ].join("\n"),
    },
    deliverable:
      "Write the new plan for tonight: who does which floors and when, what waits, and who you tell. Keep it short enough to read on a phone.",
    flaws: [
      {
        label: "the meeting room on floor 2 that has to be ready at 07:30",
        cues: ["2b", "board", "meeting", "07:30", "7:30", "floor 2", "morning", "client"],
      },
      {
        label: "the wet floor and acid cleaner on floor 5, which need a sign and two people",
        cues: ["wet", "sign", "slip", "acid", "goggles", "gloves", "two people", "together", "floor 5", "alone", "leak"],
      },
      {
        label: "the alarm at 22:00 and the key handover with fewer people",
        cues: ["alarm", "22:00", "key", "guard", "last person", "lock", "finish"],
      },
    ],
  },
  taster: {
    title: "Spot the risk in a night task",
    format: "plan",
    proofKind: "plan",
    brief: "A shift note for one cleaner tonight.",
    material: {
      kind: "text",
      title: "Shift note",
      body: [
        "21:00 Floor 5 kitchen: strong descaler on the sink.",
        "You are alone on the floor after 21:00.",
        "Mop the corridor last, then leave.",
      ].join("\n"),
    },
    deliverable: "What would you change in this note before the shift starts, and why?",
    flaws: [
      {
        label: "a strong chemical used by someone alone on the floor",
        cues: ["alone", "chemical", "descaler", "gloves", "goggles", "together", "earlier", "someone", "phone", "check"],
      },
    ],
  },
};
