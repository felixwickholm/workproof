import type { SeedProof } from "../types";

/**
 * Synthetic work for home care and occupational health. Olena's own proofs live in `story.ts`.
 * The three newest care plans arrive just after hers, so her plan is the oldest one waiting for Kaari.
 */
export const CARE_PROOFS: SeedProof[] = [
  {
    id: "proof_care_01",
    person: "priya",
    challenge: "kaari-visits",
    hoursAgo: 70,
    shareWithSimilar: true,
    answer: [
      "Keep: A (insulin, cannot move), D (alone, memory problem, needs breakfast and medicines), F, G, H, and B because the shower is weekly and was already missed once this month.",
      "Move: C to 13:00, the hospital sent the medicine list so the dispenser is ready. E shopping to Thursday. I walk to the afternoon.",
      "Calls: I phone E and I at 7:30 so they are not waiting.",
      "In Chennai I coordinated a home nursing team of 14 for four years, Wednesday mornings were always like this.",
    ].join("\n"),
    explainAnswers: [
      "Insulin first because without it the morning goes wrong for everyone after.",
      "My plan does not hang on that call. I would leave a message, keep the visit times as planned, and call again at nine.",
    ],
    decision: {
      companyId: "co-kaari",
      kind: "pass",
      feedback:
        "Thank you for calling E and I before 7:30, that is the habit we want. Client C came home yesterday on a new blood thinner dose, and the first days are when bleeding starts, so that visit cannot wait until afternoon. For this role we look for a plan that keeps every time-critical visit in the morning. Your plan for calls is something to keep.",
      hoursToReply: 2,
    },
  },
  {
    id: "proof_care_02",
    person: "sari",
    challenge: "kaari-visits",
    hoursAgo: 0.65,
    shareWithSimilar: true,
    answer: [
      "A 8:00 insulin. D 8:45 medicines and breakfast, she is alone and will not remember to eat. C 9:30 new blood thinner, check the dispenser and look at the arms and legs for bruises. F 10:15, G 11:00, H 11:45.",
      "B shower moves to Friday, E shopping to the afternoon carer. Walk with I is cancelled this week, sorry I.",
      "I call F's daughter first: if she is coming on Wednesday anyway, she can do the eye drops and F moves to the afternoon, which gives us one free slot for B.",
      "I have no home care training. I plan the night runs in a hospital laboratory, and I plan people every evening.",
    ].join("\n"),
    explainAnswers: [
      "C first, because the first days on a new blood thinner are when a wrong dose or bleeding shows. I would check by reading the hospital's medicine list against the dispenser.",
      "That is C. I would take the call, note any change to the dose, and give it to the carer before the 9:30 visit.",
    ],
  },
  {
    id: "proof_care_03",
    person: "linh",
    challenge: "kaari-visits",
    hoursAgo: 0.42,
    shareWithSimilar: false,
    answer: [
      "The AI draft moves C and D, I would not do that. C has new blood thinner since yesterday, risk of bleeding or wrong dose from the dispenser. D cannot take medicine alone.",
      "So Leena: A, C, D. Tomi: F, G, H. B, E and I move.",
      "Before 8:00 I call B and E. For I, I ask the relative if a walk on Saturday is ok.",
      "I worked 3 years as hoiva-avustaja at Kotiapu Seniorit in Vantaa before my master's in food science.",
    ].join("\n"),
    explainAnswers: [
      "A wrong dose from the dispenser or a bleed is the one risk that cannot wait until tomorrow. The other visits can move.",
      "Then C's visit moves earlier and the carer brings the new instructions. I would write the change in the client's notes for the evening shift.",
    ],
  },
  {
    id: "proof_care_04",
    person: "matilda",
    challenge: "kaari-visits",
    hoursAgo: 0.17,
    shareWithSimilar: true,
    spoken: true,
    answer:
      "Okej so tomorrow. Insulin at eight stays, obviously. The memory client who is alone stays in the morning, otherwise no breakfast and no pills. And the one who came home from hospital, I keep him too, new blood thinner, someone has to see him today. Then G, the wound, it was done yesterday so it can go to Thursday. Shower and shopping move. And I call the families before seven thirty, all of them, not only the ones who move, so nobody hears it from a confused parent first.",
    explainAnswers: [
      "Then the client sits alone without breakfast and skips the morning pills, and nobody notices until the evening.",
      "That is the client with the new blood thinner. I would ask what changed, tell the carer before the visit, and move it earlier if the dose changed.",
    ],
    spokenFollowUps: true,
  },
  {
    id: "proof_care_05",
    person: "johan",
    challenge: "otso-letter",
    hoursAgo: 120,
    shareWithSimilar: true,
    answer: [
      "Hello,",
      "Here are your results from the health check on 3 November.",
      "One result needs action: your LDL cholesterol (the \"bad\" cholesterol) is 4.9. The goal is under 3.0. Please book a new blood test within 3 months and a time with the nurse.",
      "Your blood sugar after fasting was a little high, 6.4 (normal is up to 6.0). It is not diabetes, but food and exercise help. The nurse will talk about this with you.",
      "Your other results are normal.",
      "Book a time: call 09 000 1234, Monday to Friday 8-15.",
    ].join("\n"),
    explainAnswers: [
      "The patient would read a list of numbers and not see that one of them needs a new test and a visit. The high cholesterol could then wait a year.",
      "Then the ranges go in a short table at the end. The letter still opens with the one result that needs action.",
    ],
    decision: {
      companyId: "co-otso",
      kind: "pass",
      feedback:
        "You put the cholesterol result and the booking first, and the letter fits on one screen. Our letters have to be written in Finnish by the same person who answers patient calls, so we cannot offer this role now. Your order of results is one we will copy into our template.",
      hoursToReply: 5,
    },
  },
  {
    id: "proof_care_06",
    person: "hanna",
    challenge: "otso-letter",
    hoursAgo: 60,
    shareWithSimilar: false,
    answer: [
      "Hei! Tässä tuloksesi terveystarkastuksesta 3.11.",
      "Tärkein: LDL-kolesteroli on 4,9 (tavoite alle 3,0). Varaa uusi verikoe 3 kuukauden päähän ja aika hoitajalle.",
      "Paastosokeri 6,4 on vähän koholla. Ruokavalio ja liikunta auttavat, hoitaja kertoo lisää.",
      "Muut tulokset ovat normaalit.",
      "Soita 09 000 1234 ma-pe klo 8-15.",
      "(Wrote it in Finnish since most of the patients read Finnish. I can do the English version too.)",
    ].join("\n"),
    explainAnswers: [
      "Cholesterol first because the patient has to act on it.",
      "Then only the cholesterol line and the phone number go in the message. The rest stays in the letter.",
    ],
    decision: {
      companyId: "co-otso",
      kind: "pass",
      feedback:
        "Your Finnish version is short and every line has a clear action. We want the writer in this role to also run our phone line two days a week, and the task did not show how you handle calls, so this is not now. Please keep the habit of putting the action in the first line.",
      hoursToReply: 3,
    },
  },
  {
    id: "proof_care_07",
    person: "chiamaka",
    challenge: "otso-letter",
    hoursAgo: 20,
    shareWithSimilar: true,
    answer: [
      "Dear patient, your test results are ready.",
      "Most results are fine. Two numbers are higher than we want: cholesterol and blood sugar. Higher cholesterol can harm the heart over many years, so we want to check it again.",
      "What to do: book a blood test in about 3 months and a visit to the nurse. Call us to book.",
      "I studied public health at the University of Lagos before moving here, we wrote letters like this for clinic patients all the time.",
    ].join("\n"),
    explainAnswers: [
      "The patient would not know which numbers to act on. Saying there are two up front makes the rest of the letter easy to follow.",
      "I would put the two hours in bold right next to the number, so nobody calls and waits at the wrong time.",
    ],
    decision: {
      companyId: "co-otso",
      kind: "pass",
      feedback:
        "You explained why cholesterol matters in one sentence, which many patients ask us about. The letter left out the phone number and hours, and it said the sugar was high without saying how much. The role needs Finnish on the phone every day, so it is not now.",
      hoursToReply: 2,
    },
  },
  {
    id: "proof_care_08",
    person: "priya",
    challenge: "pooled-care",
    hoursAgo: 100,
    shareWithSimilar: true,
    answer: [
      "1. Room 6 first. Glucose 3.9 and only half of dinner, and insulin \"as usual\" at 22:00. Check glucose again before giving it and call the doctor about the dose.",
      "2. Room 5: weight up 2.2 kg in a day with heart failure. That is fluid. Doctor needs to know tonight, not tomorrow.",
      "3. Room 3: \"see chart\" for the antibiotic is not a handover. Write the time. And 91% at 15:00 is six hours old.",
      "\"All patients stable\" should be removed, it is not true for rooms 5 and 6.",
    ].join("\n"),
    explainAnswers: [
      "Room 6 first because a low sugar with insulin can turn dangerous within an hour.",
      "I would read only room 6 and room 5 aloud and leave the rest on paper. The insulin and the weight cannot wait for the written note.",
    ],
    decision: {
      companyId: "co-kaari",
      kind: "pass",
      feedback:
        "You started with room 6 and gave a concrete action for each patient, and removing \"all patients stable\" is right on point. This shared role needs a nurse with a Finnish licence from the first day, so we cannot offer it now. Your proof stays open to other employers through Second look.",
      hoursToReply: 3,
    },
  },
  {
    id: "proof_care_09",
    person: "haider",
    challenge: "pooled-care",
    hoursAgo: 48,
    shareWithSimilar: false,
    answer: [
      "The note looks complete but it is not. The insulin for room 6 is the biggest problem, the sugar was low and the patient ate little. Then room 5, weight going up. I would ask the night nurse to read the chart for room 3 because the note does not say when the antibiotic was given.",
    ].join("\n"),
    explainAnswers: [
      "The insulin because it is given in a few hours and cannot be taken back.",
      "I would hold the 22:00 insulin, measure the glucose every hour and give sugar if it drops. I keep calling and write down each value.",
    ],
    decision: {
      companyId: "co-kaari",
      kind: "pass",
      feedback:
        "You saw that the insulin in room 6 could not wait, and you kept the order simple. The note for room 3 needs a time written into the handover, not a request to read the chart. This role needs nursing training we cannot provide on the job, so it is not now.",
      hoursToReply: 4,
    },
  },
  {
    id: "proof_care_10",
    person: "leila",
    challenge: "pooled-care",
    hoursAgo: 6,
    shareWithSimilar: true,
    answer: [
      "Changes before the night shift relies on it:",
      "- Room 6: insulin 22:00 needs a glucose check first, 3.9 at 19:30 with half a meal. Ask the doctor about reducing the dose.",
      "- Room 5: +2.2 kg overnight in heart failure, tell the doctor and check breathing and ankles.",
      "- Room 3: write the real time of the last antibiotic dose and measure saturation again.",
      "- Delete \"All patients stable\".",
      "I am not a nurse, I build ML tools, so please read this as a careful outsider.",
    ].join("\n"),
    explainAnswers: [
      "The night nurse could give insulin to a patient whose sugar is already low, and the patient could go hypoglycaemic during the night.",
      "If the handover had to take five minutes I would read only rooms 6 and 5 aloud.",
    ],
    decision: {
      companyId: "co-kaari",
      kind: "pass",
      feedback:
        "Your list is easy to tick off and it starts with the patient at most risk tonight. This role leads nurses on the ward, so we need a nursing licence for it. Thank you for adding what to check for room 5, not only who to tell.",
      hoursToReply: 1.5,
    },
  },
];
