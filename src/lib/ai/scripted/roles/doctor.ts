import type { RoleTemplate } from "../role-template";

export const doctor: RoleTemplate = {
  id: "doctor",
  title: "Doctor",
  level: "degree",
  keywords: [
    "doctor", "physician", "medical doctor", "general practitioner", "gp", "internist", "internal medicine",
    "resident doctor", "medical specialist", "lääkäri", "yleislääkäri", "erikoislääkäri", "sisätautilääkäri",
  ],
  skills: ["clinical-reasoning", "patient-safety", "stakeholder-communication", "ai-assisted-work"],
  cues: {
    "clinical-reasoning": ["medicines", "diagnoses", "ward rounds"],
    "stakeholder-communication": ["health centre", "discharge letters"],
  },
  why: {
    "clinical-reasoning": "A discharge summary is read by the next doctor, the pharmacy and the patient, and each acts on it.",
    "stakeholder-communication": "The health centre doctor sees the patient weeks later and has only the summary to go on.",
  },
  lookFor: {
    "clinical-reasoning": "Reads the medicines against the diagnoses and the lab values, and names the interaction or follow-up that is missing.",
    "patient-safety": "Puts the change that could harm the patient first and says how it is caught before discharge.",
  },
  constraints: [
    "the patient goes home in one hour",
    "the health centre cannot see the patient for three weeks",
    "the patient speaks little Finnish or English",
    "the ward pharmacist is off today",
  ],
  challenge: {
    minutes: 15,
    title: "Review an AI-drafted discharge summary",
    format: "fix",
    proofKind: "writing",
    brief:
      "Our internal medicine ward is testing a tool that drafts discharge summaries from the patient record. The doctor signs the summary, and the health centre and the pharmacy act on it. This is a synthetic patient from our training material. Please read it as the doctor who signs it.",
    material: {
      kind: "text",
      title: "Discharge summary draft, ward 6 (synthetic)",
      body: [
        "Patient: 74, admitted 9.11. with atrial fibrillation and a fast heart rate",
        "Other conditions: type 2 diabetes, knee arthrosis, reduced kidney function",
        "",
        "Lab values at discharge",
        "- eGFR 38 ml/min (on admission 52)",
        "- Potassium 5.4 mmol/l",
        "- INR 2.4 (warfarin started 10.11.)",
        "",
        "Medicines at home",
        "- Warfarin, dosed by INR",
        "- Metoprolol 50 mg twice a day",
        "- Metformin 1000 mg twice a day (unchanged)",
        "- Ramipril 5 mg once a day (unchanged)",
        "- Ibuprofen 400 mg up to three times a day for knee pain (new)",
        "",
        "Follow-up",
        "- Health centre visit in 3 months.",
        "",
        "The patient was told about the plan.",
      ].join("\n"),
    },
    deliverable: "What would you change or check before you sign this summary, and why? Start with the most urgent item.",
    flaws: [
      {
        label: "ibuprofen added to warfarin and reduced kidney function",
        cues: ["ibuprofen", "nsaid", "bleeding", "warfarin", "paracetamol", "stop"],
      },
      {
        label: "metformin and ramipril unchanged while eGFR fell to 38 and potassium is 5.4",
        cues: ["metformin", "egfr", "38", "potassium", "5.4", "ramipril", "kidney function", "dose"],
      },
      {
        label: "no INR check planned for a patient who started warfarin a few days ago",
        cues: ["inr", "check", "follow-up", "3 months", "few days", "next week", "anticoagulation"],
      },
    ],
  },
  taster: {
    title: "Read one discharge line",
    format: "fix",
    proofKind: "writing",
    brief: "Lines from a synthetic discharge summary.",
    material: {
      kind: "text",
      title: "Discharge summary",
      body: [
        "New medicine: warfarin, started yesterday.",
        "New for knee pain: ibuprofen 400 mg three times a day.",
        "Next INR check: in one month.",
      ].join("\n"),
    },
    deliverable: "What would you change first, and why?",
    flaws: [
      {
        label: "ibuprofen with warfarin and an INR check a month away",
        cues: ["ibuprofen", "bleeding", "nsaid", "paracetamol", "inr", "sooner", "interaction"],
      },
    ],
  },
};
