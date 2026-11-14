import type { RoleTemplate } from "../role-template";

export const teacher: RoleTemplate = {
  id: "teacher",
  title: "Subject teacher",
  level: "degree",
  keywords: [
    "teacher", "teaching", "educator", "lecturer", "class teacher", "subject teacher",
    "opettaja", "luokanopettaja", "aineenopettaja", "lehtori", "opetus", "coach", "football coach", "sports coach", "valmentaja",
  ],
  skills: ["lesson-design", "mixed-level-teaching", "technical-explanation", "plain-language", "ai-assisted-work"],
  why: {
    "lesson-design": "The first 20 minutes decide whether the class follows the rest of the lesson.",
    "mixed-level-teaching": "Some pupils did this topic last year, and some are still learning Finnish.",
    "technical-explanation": "Pupils learn from what they understand, not from what is correct.",
    "plain-language": "A pupil new to Finnish can do the maths if the words do not stop them.",
  },
  lookFor: {
    "lesson-design": "Gives each part of the lesson start a purpose that leads to the goal.",
    "mixed-level-teaching": "Says what each group of pupils does, and how the teacher sees who needs help.",
    "technical-explanation": "Explains percentages with an example the pupils know from daily life.",
    "plain-language": "Uses short sentences, numbers and pictures that a pupil new to Finnish can follow.",
  },
  constraints: [
    "the lesson is cut to 30 minutes",
    "the tablets do not work today",
    "two more pupils join who speak no Finnish yet",
    "the pupils who are ahead finish in five minutes",
  ],
  challenge: {
    minutes: 15,
    title: "Plan a 20-minute lesson start for a mixed-level class",
    format: "make",
    proofKind: "plan",
    brief:
      "You teach maths to a year 8 class tomorrow. The pupils are at very different levels. Plan the first 20 minutes of the lesson. This is a synthetic class.",
    material: {
      kind: "text",
      title: "Year 8 maths, Tuesday 9:00 (synthetic)",
      body: [
        "22 pupils in year 8. They sit in pairs. Whiteboard and 11 tablets.",
        "Topic this week: percentages.",
        "Goal for the lesson: find any percentage of a number.",
        "",
        "- 5 pupils did this topic last year at their old school.",
        "- 4 pupils came from abroad this autumn. Strong in maths, still learning Finnish.",
        "- 3 pupils have a reading support plan.",
        "- Last test: most found 10% of a number. Few found 35%.",
      ].join("\n"),
    },
    deliverable: "Write the first 20 minutes, step by step, and say how each group of pupils takes part.",
    flaws: [
      {
        label: "the pupils still learning Finnish, who need the task in numbers and pictures",
        cues: ["finnish", "language", "picture", "pictures", "numbers", "visual", "abroad", "words"],
      },
      {
        label: "the pupils who are ahead and need a harder step",
        cues: ["ahead", "last year", "harder", "extra", "challenge", "35%", "stronger", "fast"],
      },
      {
        label: "a quick check in the first minutes of who can already do it",
        cues: ["check", "start with", "warm-up", "10%", "mini", "show me", "whiteboards", "exit", "question"],
      },
    ],
  },
  taster: {
    title: "Explain 10% in one sentence",
    format: "make",
    proofKind: "writing",
    brief: "A pupil who is new to Finnish asks you what 10% means.",
    material: {
      kind: "text",
      title: "The pupil's question",
      body: "\"What is 10 percent of 50 euros?\"",
    },
    deliverable: "What would you say or draw, and why?",
    flaws: [
      {
        label: "an example with money or a picture the pupil already knows",
        cues: ["5 euros", "five", "divide", "ten parts", "coins", "picture", "draw", "split", "10 parts"],
      },
    ],
  },
};
