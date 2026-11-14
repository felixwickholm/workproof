import type { SeedProof } from "../types";

/** Synthetic night cleaning plans for Kirkas Facility Services. Olena's own plan is part of the story. */
export const CLEANING_PROOFS: SeedProof[] = [
  {
    id: "proof_clean_01",
    person: "sari",
    challenge: "kirkas-night",
    hoursAgo: 150,
    shareWithSimilar: false,
    answer: [
      "A: 18-19 floor 1, 19-20 floor 2 incl. 2B (must be ready for 7:30, I check it myself before I leave).",
      "B: 18-19:30 floor 3, 19:30-20:30 floor 4.",
      "A + B together 20:30-21:45 floor 5: wet floor sign up first thing at 18:00 by the lift, acid cleaner only when both are there, gloves and goggles.",
      "Floor 6 waits. I text the client contact before 18:30 that the archive is done tomorrow.",
      "Alarm 22:00: both out by 21:50, B hands the key to the guard, A waits so nobody walks out alone.",
      "I tell A and B by phone before they start and send the plan in the group chat.",
    ].join("\n"),
    explainAnswers: [
      "2B first on floor 2 because a board meeting room is what the client notices in the morning.",
      "If B could only stay until 21:30 I would do floor 5 from 20:00 and skip the kitchen on floor 4.",
    ],
    decision: {
      companyId: "co-kirkas",
      kind: "meet",
      feedback:
        "You put meeting room 2B early in the night, kept two people together on the wet floor, and told the client about floor 6 before the shift started. That is the plan we wanted to see. Let us meet and talk about leading the evening shifts.",
      hoursToReply: 4,
      meeting: "accepted",
    },
  },
  {
    id: "proof_clean_02",
    person: "zainab",
    challenge: "kirkas-night",
    hoursAgo: 96,
    shareWithSimilar: true,
    answer: [
      "First the safety. Floor 5 is wet next to the lift, so the first person in puts up the warning sign before anything else. The acid cleaner needs two people, so floor 5 is done by both cleaners together, around 20:00.",
      "Floor 2 meeting room 2B is needed 07:30, so cleaner A does it right after the lobby.",
      "Floors 3 and 4 by B like before. Floor 6 is archive, it can wait one night, I will tell the customer.",
      "I worked at Lumivalo Services for six years as cleaner and two as team leader in Vantaa, this happens almost every week in winter.",
    ].join("\n\n"),
    explainAnswers: [
      "Safety first because if someone slips, the whole night plan is gone anyway.",
      "If the floor machine was broken I would mop floor 5 by hand and leave the machine work for the morning team.",
    ],
    decision: {
      companyId: "co-kirkas",
      kind: "pass",
      feedback:
        "Your plan starts with the warning sign and two people on floor 5, which keeps everyone safe. We promoted someone from our own night team to this role this week, so it is not now. Your proof stays open to other employers through Second look.",
      hoursToReply: 2,
    },
  },
  {
    id: "proof_clean_03",
    person: "iryna",
    challenge: "kirkas-night",
    hoursAgo: 30,
    shareWithSimilar: true,
    answer: [
      "Plan with 2 cleaners:",
      "1. 18:00 sign on wet floor 5 (A, takes 2 min).",
      "2. A: floor 1 then floor 2, meeting room 2B first. B: floor 3, floor 4.",
      "3. 20:30 A and B together floor 5 with the acid cleaner.",
      "4. Floor 6 tomorrow, message to client.",
      "5. 21:45 last check, key to guard 21:55.",
      "I came from Kharkiv in 2022 and clean offices in the evening, before that I was a shift lead in a hotel.",
    ].join("\n"),
    explainAnswers: [
      "The sign first because it takes two minutes and protects everybody who walks there.",
      "If I could come myself for two hours I would take floor 6 so the client gets everything.",
    ],
  },
];
