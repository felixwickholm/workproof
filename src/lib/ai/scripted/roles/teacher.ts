import type { RoleTemplate } from "../role-template";

export const teacher: RoleTemplate = {
  id: "teacher",
  title: "Teacher",
  level: "degree",
  keywords: [
    "teacher", "teaching", "educator", "lecturer", "class teacher", "subject teacher",
    "opettaja", "luokanopettaja", "aineenopettaja", "lehtori", "opetus", "coach", "football coach", "sports coach", "valmentaja",
  ],
  skills: ["lesson-design", "technical-explanation", "prioritisation", "ai-assisted-work"],
  why: {
    "lesson-design": "Forty-five minutes go fast, and every activity has to serve the goal.",
    "technical-explanation": "Pupils learn from what they understand, not from what is correct.",
  },
  lookFor: {
    "lesson-design": "Checks that activities match the learning goal and that the plan fits the time.",
    "technical-explanation": "Explains a concept in words the pupils in this class would follow.",
  },
  constraints: [
    "a third of the class joined from another school this week",
    "the lesson is cut to 30 minutes",
    "there are only eight laptops for 24 pupils",
    "two pupils are still learning Finnish",
  ],
  challenge: {
    title: "Review an AI-drafted lesson plan",
    format: "review",
    proofKind: "plan",
    brief:
      "A colleague used an AI assistant to plan a 45-minute maths lesson on fractions for year 5. The lesson is tomorrow, and the colleague asked for a second read. Please read it as if you had to teach it.",
    material: {
      kind: "text",
      title: "Lesson plan: adding fractions, year 5, 45 minutes",
      body: [
        "Goal: pupils can add fractions with different denominators.",
        "",
        "0-5 min    Warm-up: times tables quiz.",
        "5-15 min   Teacher explains: to add fractions, add the tops and add the bottoms.",
        "           Example: 1/2 + 1/3 = 2/5.",
        "15-25 min  Video: the history of fractions in ancient Egypt.",
        "25-40 min  Worksheet: 30 problems, all with different denominators.",
        "40-45 min  Pupils hand in the worksheet.",
        "",
        "Materials: projector, worksheet, video link.",
        "Differentiation: fast pupils can start homework.",
        "Assessment: worksheets are marked next week.",
      ].join("\n"),
    },
    deliverable:
      "What would you change before this lesson is taught, and why? Start with the change that matters most for the pupils.",
    flaws: [
      {
        label: "the wrong method and example for adding fractions",
        cues: ["2/5", "add the bottoms", "wrong", "common denominator", "5/6", "incorrect", "method"],
      },
      {
        label: "a video that does not serve the lesson goal",
        cues: ["video", "egypt", "history", "goal", "ten minutes", "10 minutes", "not related"],
      },
      {
        label: "no check of understanding before the worksheet and feedback a week later",
        cues: ["check", "understanding", "practice", "guided", "next week", "feedback", "exit ticket", "30 problems"],
      },
    ],
  },
  taster: {
    title: "Read one exam question",
    format: "review",
    proofKind: "writing",
    brief: "An AI assistant wrote this question for a year 8 science test.",
    material: {
      kind: "text",
      title: "Question 4",
      body: [
        "Which of these is not a mammal?",
        "a) whale  b) bat  c) penguin  d) dolphin  e) all of the above",
      ].join("\n"),
    },
    deliverable: "What would you change in this question, and why?",
    flaws: [
      {
        label: "an answer option that makes the question confusing",
        cues: ["all of the above", "option e", "confusing", "negative", "not a mammal", "e)"],
      },
    ],
  },
};
