import type { RoleTemplate } from "../role-template";

export const nurse: RoleTemplate = {
  id: "nurse",
  title: "Nurse",
  level: "degree",
  keywords: [
    "nurse", "nursing", "registered nurse", "practical nurse", "ward", "clinical",
    "sairaanhoitaja", "hoitaja", "lähihoitaja", "terveydenhoitaja",
  ],
  skills: ["patient-safety", "stakeholder-communication", "prioritisation", "ai-assisted-work"],
  why: {
    "patient-safety": "Handover is where information gets lost between shifts.",
    "stakeholder-communication": "The next nurse acts on what the note says, not on what you meant.",
  },
  lookFor: {
    "patient-safety": "Spots the item in the note that could harm a patient and says how to catch it.",
    prioritisation: "Puts the most urgent patient first and explains the order.",
  },
  constraints: [
    "the next shift has one nurse less than usual",
    "the doctor on call cannot be reached for an hour",
    "the handover has to be done in five minutes",
    "the patient's family calls during handover",
  ],
  challenge: {
    title: "Review an AI-drafted shift handover",
    format: "review",
    proofKind: "writing",
    brief:
      "Our ward is testing a tool that drafts the handover note from the patient records. The night shift reads it at 21:00. This is a synthetic example from the training ward. Please read it as the nurse who takes over.",
    material: {
      kind: "text",
      title: "Handover note, ward 4, evening to night (synthetic)",
      body: [
        "Room 2, patient A, 78, hip fracture, operated today",
        "- Pain medicine: oxycodone 5 mg given 18:00. Next dose when needed.",
        "- Fall risk: yes. Bed alarm on.",
        "",
        "Room 3, patient B, 64, pneumonia",
        "- Antibiotic IV every 8 hours. Last dose: see chart.",
        "- Oxygen 2 l/min. Saturation 91% at 15:00.",
        "",
        "Room 5, patient C, 82, heart failure",
        "- Furosemide 40 mg given 08:00 and 20:00.",
        "- Weight today 71.4 kg, yesterday 69.2 kg.",
        "- Allergy: penicillin.",
        "",
        "Room 6, patient D, 55, diabetes, admitted for wound care",
        "- Blood glucose 3.9 at 19:30. Ate half of dinner.",
        "- Insulin as usual at 22:00.",
        "",
        "All patients stable.",
      ].join("\n"),
    },
    deliverable:
      "What would you change or check before the night shift relies on this note, and why? Start with the most urgent item.",
    flaws: [
      {
        label: "insulin planned as usual after a low blood glucose and half a meal",
        cues: ["glucose", "3.9", "hypo", "insulin", "low sugar", "half of dinner", "check before"],
      },
      {
        label: "a weight gain of over 2 kg in a heart failure patient left without comment",
        cues: ["weight", "2.2", "2 kg", "fluid", "heart failure", "71.4", "doctor"],
      },
      {
        label: "the antibiotic time hidden behind \"see chart\" and an oxygen value from six hours ago",
        cues: ["see chart", "last dose", "antibiotic", "saturation", "91", "15:00", "old value", "stable"],
      },
    ],
  },
  taster: {
    title: "Read one handover line",
    format: "review",
    proofKind: "writing",
    brief: "This line is from a synthetic handover note.",
    material: {
      kind: "text",
      title: "Handover line",
      body: [
        "Room 7: new patient, antibiotic started 16:00.",
        "Allergies: not asked yet, patient was sleeping.",
        "Next dose 00:00.",
      ].join("\n"),
    },
    deliverable: "What would you do first, and why?",
    flaws: [
      {
        label: "an antibiotic started before allergies were checked",
        cues: ["allerg", "ask", "check", "reaction", "anaphyla", "before the next dose"],
      },
    ],
  },
};
