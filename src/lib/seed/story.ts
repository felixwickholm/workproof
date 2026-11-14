import type { StoryStage } from "@/lib/domain/types";
import type { SecondLookSeed } from "./second-look";
import type { SeedProof } from "./types";

/** The story stages in order. Each stage is the previous one plus a few changes. */
export const STORY_STAGES: readonly StoryStage[] = ["before", "sent", "invited", "met"];

export function stageReached(stage: StoryStage, at: StoryStage): boolean {
  return STORY_STAGES.indexOf(stage) >= STORY_STAGES.indexOf(at);
}

export const STORY_PROOF_ID = "proof_story_kaari_8";

/** Olena's earlier plan, answered "not now" by its own employer, which reaches Otso Health through Second look. */
export const OLENA_EARLIER_PLAN_ID = "proof_story_kirkas";

/**
 * Olena's two earlier proofs. The laboratory night plan got a "not now" with a reason; the result
 * letter has been read and waits for an answer.
 */
export const OLENA_EARLIER: SeedProof[] = [
  {
    id: OLENA_EARLIER_PLAN_ID,
    person: "olena",
    challenge: "kirkas-runs",
    hoursAgo: 140,
    shareWithSimilar: true,
    answer: [
      "Tonight, A1 and H1 only, 22:00-06:00.",
      "A1: emergency samples first, every time one arrives. Troponin and potassium change treatment within the hour. The occupational health batch fills the gaps, the rest on Thursday morning. It has no deadline before Friday.",
      "INR: to the partner lab by courier at 23:00, 01:30 and 04:00. After 4 hours the result cannot be used, and a patient on a new warfarin dose needs it.",
      "Ward samples at 05:00: blood counts on H1, chemistry on A1 after the emergency queue.",
      "22:10 call the emergency department and the doctor on call: which results are slower tonight, and until when.",
      "I was the doctor waiting for these results for 11 years, so I know which ones cannot be late. I clean offices at night now.",
    ].join("\n"),
    explainAnswers: [
      "Emergency first, because a potassium of 6.5 that waits two hours can stop a heart.",
      "Then the batch stops at midnight and she stays with A1 and the emergency samples. The INR boxes are packed before midnight, so she only hands them to the courier.",
    ],
    decision: {
      companyId: "co-kirkas",
      kind: "pass",
      feedback:
        "Your plan runs the emergency samples first and sends the INR samples to the partner lab inside four hours, which is the call we needed. This month the planner also runs the night alone on our analyser platform, and that needs a certification we cannot arrange before December, so it is not now. Please keep writing plans with times like this, the night team reads them on their phones.",
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

/**
 * At stage "met", Otso Health reads Olena's earlier plan through Second look. Its own employer said
 * not now and she allowed Second look, and Otso's shared task asks for at least two of the same core
 * skills (prioritisation and stakeholder communication). The seed test replays the rule on it.
 */
export const OTSO_SECOND_LOOK: SecondLookSeed = {
  proofId: OLENA_EARLIER_PLAN_ID,
  companyId: "co-otso",
  kind: "meet",
  feedback:
    "We read your night plan through Second look. You put the results that change treatment first, decided what could wait until Friday and called the emergency department before anyone asked, which is how our nurses plan a short-staffed handover. We would like to talk with you about shift handovers at our clinic.",
  hoursAgo: 0.1,
  meeting: "invited",
};
