import type { MeetingStatus, StoryStage } from "@/lib/domain/types";
import type { SeedProof } from "./types";

/** The story stages in order. Each stage is the previous one plus a few changes. */
export const STORY_STAGES: readonly StoryStage[] = ["before", "sent", "invited", "met"];

export function stageReached(stage: StoryStage, at: StoryStage): boolean {
  return STORY_STAGES.indexOf(stage) >= STORY_STAGES.indexOf(at);
}

export const STORY_PROOF_ID = "proof_story_kaari";

/**
 * Olena's two earlier proofs. The night plan got a "not now" with a reason; the result letter
 * has been read and waits for an answer.
 */
export const OLENA_EARLIER: SeedProof[] = [
  {
    id: "proof_story_kirkas",
    person: "olena",
    challenge: "kirkas-night",
    hoursAgo: 140,
    shareWithSimilar: true,
    answer: [
      "Tonight, two cleaners for six floors, 18:00-22:00.",
      "18:00 A puts the wet floor sign by the lift on floor 5 before anything else. Nobody uses the acid cleaner alone, so floor 5 is done by A and B together at 20:30.",
      "A: floor 1, then floor 2 with meeting room 2B first, it is needed at 07:30.",
      "B: floors 3 and 4.",
      "Floor 6 archive waits one night. I message the client contact at 18:15.",
      "21:50 both leave together, B gives the key to the guard before the alarm at 22:00.",
      "I clean offices at night myself, so I know which room the client checks first.",
    ].join("\n"),
    explainAnswers: [
      "The sign first, because it takes one minute and a fall on a wet floor ends the whole night.",
      "If the floor machine was broken, floor 5 is mopped by hand and I tell the morning team.",
    ],
    decision: {
      companyId: "co-kirkas",
      kind: "pass",
      feedback:
        "Your plan keeps two people on the wet floor and has meeting room 2B ready for the morning, which is what the client checks. This supervisor drives between three sites every night and needs a driving licence, so it is not now. Please keep writing the plan with times like this, our teams read it on their phones.",
      hoursToReply: 6,
    },
  },
  {
    id: "proof_story_otso",
    person: "olena",
    challenge: "otso-letter",
    hoursAgo: 30,
    shareWithSimilar: true,
    answer: [
      "Hello,",
      "Your results from the health check on 3 November are ready.",
      "Please do this: book a new blood test in 3 months, and a time with the nurse. Your LDL cholesterol is 4.9. It should be under 3.0. High LDL slowly harms the blood vessels, and it can be lowered.",
      "Your fasting blood sugar is 6.4, a little over the normal 6.0. This is not diabetes. Less sugar, less white bread and a daily walk help.",
      "Blood count and thyroid are normal.",
      "Call 09 000 1234 to book, Monday to Friday 8 to 15.",
    ].join("\n"),
    explainAnswers: [
      "The cholesterol goes first because it is the only result that asks the patient to do something.",
      "If the doctor wants the reference ranges, I keep them in brackets after each number.",
    ],
  },
];

/** The story proof: Olena's plan for Kaari Home Care. Seven details in it identify her. */
export const OLENA_STORY: SeedProof = {
  id: STORY_PROOF_ID,
  person: "olena",
  challenge: "kaari-visits",
  hoursAgo: 0.92,
  shareWithSimilar: true,
  answer: [
    "Keep in the morning:",
    "- A 08:00, insulin. It cannot move.",
    "- C 08:30. The new blood thinner dose after yesterday's hospital stay makes this visit urgent. The AI draft moves it to the afternoon, and I would not. Check the dispenser against the hospital list and look for bruises, nose bleeding or dark urine.",
    "- D 09:00, memory disorder and alone. Without the visit there is no breakfast and no medicine.",
    "- F, G and H as booked. G only if the daughter cannot help F.",
    "",
    "First call at 7:00: the daughter of client F. She often visits on Wednesdays. If she can come in the morning, she gives the eye drops at breakfast and we win one slot.",
    "",
    "Move: B shower to Thursday, E shopping to the afternoon, I walk to Friday. Each of them gets a call before 8:00, so nobody waits at the door.",
    "",
    "I was a doctor of internal medicine in Kyiv for 11 years, after Kyiv Medical Institute No. 2. I came to Finland in 2023. Now I work at Yöpuhdas Oy, cleaning offices at night in Espoo. My Ukrainian licence is still in process here. Planning a ward morning with too few people was my daily work.",
    "",
    "Olena Kovalenko",
  ].join("\n"),
  explainAnswers: [
    "The blood thinner comes first because the first days after a dose change are when bleeding happens.",
    "Then the third carer takes G and H, and Tomi gets time for the shower visit before noon. The blood thinner visit stays at 08:30.",
  ],
  spokenFollowUps: true,
};

/** Anna Koivisto's decision on the story proof, from stage "invited". */
export const ANNA_DECISION = {
  companyId: "co-kaari",
  kind: "meet" as const,
  feedback: "You saw the blood thinner risk that our own draft missed. I want to hear how you would brief the evening shift.",
  hoursAgo: 0.5,
};

/** Hours ago Olena accepted Kaari's invitation, at stage "met". */
export const OLENA_ACCEPTED_HOURS_AGO = 0.25;

/** Otso Health reads the same proof through Second look, with Olena's consent, at stage "met". */
export const OTSO_SECOND_LOOK = {
  companyId: "co-otso",
  kind: "meet" as const,
  feedback:
    "We read your plan through Second look. You checked the new blood thinner against the hospital list, which is what our nurses do after every discharge. We would like to talk with you about care coordination at our clinic.",
  hoursAgo: 0.1,
  meeting: "invited" as MeetingStatus,
};
