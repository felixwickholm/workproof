import type { RoleTemplate } from "../role-template";

export const labOperationsPlanner: RoleTemplate = {
  id: "lab-operations-planner",
  title: "Laboratory operations planner",
  level: "degree",
  keywords: [
    "laboratory operations", "lab operations", "laboratory planner", "lab planner", "laboratory manager", "lab manager",
    "biomedical scientist", "biomedical laboratory scientist", "medical laboratory scientist", "laboratory scientist",
    "bioanalyst", "bioanalyytikko", "laboratoriohoitaja", "laboratorio",
  ],
  skills: ["prioritisation", "patient-safety", "stakeholder-communication", "planning", "lab-practice"],
  cues: {
    prioritisation: ["urgent samples", "emergency samples", "sample runs"],
    "patient-safety": ["results on time", "sample stability"],
    planning: ["run plans", "night runs"],
  },
  why: {
    prioritisation: "With fewer analysers, the order of the runs decides whose result comes too late.",
    "patient-safety": "Some samples spoil within hours, and an emergency result that waits can change a treatment.",
  },
  lookFor: {
    prioritisation: "Runs emergency samples first and moves routine batches that can wait to the morning.",
    "patient-safety": "Notices which samples spoil before the analysers are back and sends them on in time.",
    "stakeholder-communication": "Tells the emergency department and the wards what changes tonight, in a few clear lines.",
  },
  constraints: [
    "the partner lab's courier can come only once, at 01:00",
    "analyser C1 is back at 03:00, not 06:00",
    "the emergency department sends twice the usual number of samples",
    "only one biomedical scientist is on shift after midnight",
  ],
  challenge: {
    title: "Two analysers are down tonight. Re-plan the sample runs",
    format: "plan",
    proofKind: "plan",
    brief:
      "You plan the night at a laboratory that serves two hospitals and several health centres. Chemistry analyser A2 and coagulation analyser C1 broke down at 21:30, and the service engineer comes at 06:00. An AI assistant drafted the plan below from the run list. This is a synthetic example. Please re-plan the night.",
    material: {
      kind: "text",
      title: "Night run plan, 22:00-06:00 (synthetic)",
      body: [
        "Tonight: A1 chemistry ok, A2 chemistry down, C1 coagulation down, H1 blood count ok",
        "",
        "Expected samples 22:00-06:00",
        "- Emergency department: about 60 (potassium, troponin, CRP, INR)",
        "- Wards: about 140 morning samples, taken 05:00-06:00",
        "- Occupational health batch: 300 cholesterol and glucose, taken today",
        "",
        "AI-drafted plan",
        "- 22:00-02:00 A1: occupational health batch, to clear the backlog",
        "- 02:00-06:00 A1: emergency samples as they come",
        "- INR samples: keep in the fridge until C1 is repaired at 06:00",
        "- H1: no change",
        "",
        "Notes",
        "- INR must be analysed within 4 h of sampling. A partner lab in the",
        "  next town runs coagulation day and night (courier 40 min).",
        "- The occupational health batch has no clinical deadline before Friday.",
        "- Nobody has told the emergency department yet.",
      ].join("\n"),
    },
    deliverable:
      "Write the new plan for tonight: which samples run where and when, what waits or goes elsewhere, and who you tell. Keep it short enough to read on a phone.",
    flaws: [
      {
        label: "emergency samples put after a routine batch with no deadline",
        cues: ["emergency", "troponin", "potassium", "occupational health", "batch", "friday", "routine", "first", "later"],
      },
      {
        label: "INR samples kept until 06:00 although they must be analysed within 4 hours",
        cues: ["inr", "4 h", "four hours", "partner lab", "courier", "coagulation", "send", "spoil", "fridge"],
      },
      {
        label: "the emergency department not told that results will be slower",
        cues: ["tell", "call", "inform", "emergency department", "message", "wards", "doctor on call", "delay"],
      },
    ],
  },
  taster: {
    title: "Spot the risk in one run note",
    format: "plan",
    proofKind: "plan",
    brief: "A note for tonight's laboratory shift.",
    material: {
      kind: "text",
      title: "Run note",
      body: [
        "Coagulation analyser down until 08:00.",
        "INR samples from the ward: keep in the fridge.",
        "Run them all at 08:00.",
      ].join("\n"),
    },
    deliverable: "What would you change in this note, and why?",
    flaws: [
      {
        label: "samples that spoil before the analyser is back",
        cues: ["4 h", "hours", "spoil", "too old", "stable", "partner", "courier", "send", "another lab", "time limit"],
      },
    ],
  },
};
