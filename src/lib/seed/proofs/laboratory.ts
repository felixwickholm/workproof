import type { SeedProof } from "../types";

/** Synthetic night plans for Kirkas Diagnostics. Olena's own plan is part of the story. */
export const LAB_PROOFS: SeedProof[] = [
  {
    id: "proof_lab_01",
    person: "sari",
    challenge: "kirkas-runs",
    hoursAgo: 150,
    shareWithSimilar: false,
    answer: [
      "A1 22:00-06:00: emergency samples first, always, as they arrive. Potassium and troponin cannot wait behind a batch.",
      "Occupational health batch: in the gaps between emergency runs, the rest on Thursday morning on A1 and A2. No clinical deadline before Friday.",
      "INR: courier to the partner lab at 23:00 and 02:00, so no sample is older than 4 h when it is analysed. I phone the partner lab before 22:15.",
      "Ward samples 05:00-06:00: blood counts on H1 as usual, chemistry on A1 after the emergency queue.",
      "22:15 I call the emergency department and the doctor on call: chemistry results may take 20 minutes longer, INR about 90 minutes.",
    ].join("\n"),
    explainAnswers: [
      "Emergency samples would wait behind 300 routine tests, and a potassium or troponin result could come hours late for a patient being treated now.",
      "Then that one scientist stays at A1 all night. I pack the INR samples for the couriers before midnight, and the rest of the batch waits for the morning team.",
    ],
    decision: {
      companyId: "co-kirkas",
      kind: "meet",
      feedback:
        "You kept every emergency sample first, timed the courier so no INR sample passes four hours, and called the emergency department before the first result was late. That is the night plan we wanted to see. Let us meet and talk about planning the night shifts.",
      hoursToReply: 4,
      meeting: "accepted",
    },
  },
  {
    id: "proof_lab_02",
    person: "zainab",
    challenge: "kirkas-runs",
    hoursAgo: 96,
    shareWithSimilar: true,
    answer: [
      "First the patients who are in the hospital now. Emergency samples go on A1 the moment they arrive, the occupational health batch only fills the free time, and most of it waits for the morning.",
      "INR cannot stay in the fridge until 06:00, after 4 hours the result is not valid. I send them to the partner lab with the courier, two runs in the night.",
      "I tell the emergency department and the wards what is slower tonight and until when.",
      "I worked eight years as a biomedical laboratory scientist in a hospital lab in Baghdad. Analysers going down at night happened every winter.",
    ].join("\n\n"),
    explainAnswers: [
      "Emergency first because a troponin result can change what the doctor does in the next hour.",
      "Then the occupational health batch stops for the night and A1 runs only emergency and ward samples. I would also ask the partner lab if they can take some chemistry.",
    ],
    decision: {
      companyId: "co-kirkas",
      kind: "pass",
      feedback:
        "Your plan puts the emergency samples first and gets the INR samples to the partner lab in time, which keeps patients safe. We filled this role from our own night team this week, so it is not now. Your proof stays open to other employers through Second look.",
      hoursToReply: 2,
    },
  },
  {
    id: "proof_lab_03",
    person: "iryna",
    challenge: "kirkas-runs",
    hoursAgo: 30,
    shareWithSimilar: true,
    answer: [
      "Plan for tonight:",
      "1. 22:00 message to the emergency department and the wards: A2 and C1 down until 06:00, chemistry slower, INR goes to the partner lab.",
      "2. A1: emergency first, all night. Occupational health batch after 06:00, it can wait until Friday.",
      "3. INR: courier every 3 h, first one at 23:00.",
      "4. H1 as usual.",
      "5. 05:30 handover note for the morning team about A2 and the batch.",
      "In Kharkiv I ran the quality control lab of a medicine factory for seven years.",
    ].join("\n"),
    explainAnswers: [
      "The doctors would keep calling the lab to ask where the results are, and the person at A1 would answer phones instead of running samples.",
      "Then the INR samples taken after 03:00 run here on C1, and only the earlier ones go to the partner lab.",
    ],
  },
];
