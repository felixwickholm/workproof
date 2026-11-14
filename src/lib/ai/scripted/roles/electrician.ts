import type { RoleTemplate } from "../role-template";

export const electrician: RoleTemplate = {
  id: "electrician",
  title: "Electrician",
  level: "practice",
  keywords: [
    "electrician", "electrical installer", "electrical fitter", "installation electrician", "wiring",
    "sähköasentaja", "sähkömies", "sähköasennus", "sähkötyö",
  ],
  skills: ["electrical-safety", "work-safety", "showing-the-work", "planning"],
  why: {
    "electrical-safety": "A loose conductor or a missing residual current device can stay hidden in a wall until it starts a fire.",
    "work-safety": "Most electrical injuries happen on circuits someone believed were off.",
  },
  lookFor: {
    "electrical-safety": "Checks the protection and the conductor size against the circuit, and tests the socket before handing it over.",
    "work-safety": "Isolates, locks and proves the circuit dead before touching it.",
  },
  constraints: [
    "the building's main board is in a locked room",
    "the tenant needs power back in the kitchen by evening",
    "the old wiring turns out to have no protective earth",
    "the tester's battery is flat",
  ],
  challenge: {
    minutes: 15,
    title: "Show a socket you connected and how you tested it",
    format: "make",
    proofKind: "photo",
    brief:
      "We are renovating a kitchen in a block of flats. The work order below was written by our planning tool from the floor plan. Please show us how you would connect the new double socket by the sink and how you would test it before the client uses it. This is a synthetic example.",
    material: {
      kind: "text",
      title: "Work order, flat C 7, kitchen (synthetic)",
      body: [
        "Task: add a double socket next to the sink.",
        "Circuit: F6, kitchen sockets, 16 A breaker.",
        "Cable: extend from the existing box with 1.5 mm² cable (left over from lighting).",
        "",
        "Board",
        "- F6 is a plain breaker. No residual current device on this circuit.",
        "- Board label for F6 reads 'kitchen + bathroom fan'.",
        "",
        "Safety",
        "- Tenant at home. Switch F6 off while working.",
        "- Lock-off kit: not needed for a short job.",
        "",
        "Handover",
        "- Plug in the kettle to check it works.",
        "- Fill in the inspection record afterwards.",
        "",
        "Time planned: 1 h.",
      ].join("\n"),
    },
    deliverable:
      "Take one photo of the open box or the board, not of people. Or describe it in words or by voice. Tell us what you would change in the work order and how you test the socket.",
    flaws: [
      {
        label: "a breaker switched off with the tenant at home and no lock-off",
        cues: ["lock", "padlock", "tag", "isolat", "prove dead", "voltage tester", "tenant", "switch back"],
      },
      {
        label: "a socket by the sink on a circuit with no residual current device",
        cues: ["rcd", "residual current", "sink", "wet", "vikavirtasuoja", "30 ma"],
      },
      {
        label: "lighting cable on a sixteen amp socket circuit, tested only with a kettle",
        cues: ["1.5", "2.5", "cable", "conductor", "16 a", "kettle", "test", "measure", "insulation", "continuity"],
      },
    ],
  },
  taster: {
    title: "Read one job note",
    format: "fix",
    proofKind: "writing",
    brief: "This note was left for the next electrician.",
    material: {
      kind: "text",
      title: "Job note",
      body: [
        "Bathroom light: new fitting installed.",
        "Breaker F3 switched off at the board.",
        "Someone might switch it back on, so be quick.",
      ].join("\n"),
    },
    deliverable: "Tell us in words or by voice: what would you do before you touch the wires, and why?",
    flaws: [
      {
        label: "a circuit left switched off with no lock and not proven dead",
        cues: ["lock", "padlock", "tag", "test", "prove", "dead", "tester", "measure", "quick"],
      },
    ],
  },
};
