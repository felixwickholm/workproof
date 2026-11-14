import type { RoleTemplate } from "../role-template";

export const dataScientist: RoleTemplate = {
  id: "data-scientist",
  title: "Data scientist",
  level: "degree",
  keywords: [
    "data scientist", "data science", "forecasting", "forecast", "time series", "predictive model",
    "datatieteilijä", "datatiede", "ennustemalli", "ennustaminen",
  ],
  skills: ["data-visualisation", "ml-evaluation", "data-quality", "scientific-reasoning", "stakeholder-communication"],
  why: {
    "data-visualisation": "The operations team looks at this chart every Monday and buys reserve power from it.",
    "ml-evaluation": "A forecast can be right on average and still wrong at the hours that cost the most.",
    "data-quality": "Cold days are rare in the history, so the model has seen few of them.",
    "scientific-reasoning": "One week is a small sample. The claim in the note should fit what the chart can show.",
  },
  lookFor: {
    "data-visualisation": "Reads the chart for where the two lines part, not only for the overall shape.",
    "ml-evaluation": "Sees that the average error hides misses at the peak hours.",
    "data-quality": "Asks whether the model learned from enough cold days.",
    "scientific-reasoning": "Says what one week of data can and cannot prove.",
    "stakeholder-communication": "Puts the one thing the team must know in the first sentence.",
  },
  constraints: [
    "the operations team reads only the first line of your note",
    "next week is forecast to be even colder",
    "you can add one more line to the chart",
    "the model cannot be retrained before January",
  ],
  challenge: {
    minutes: 10,
    title: "Read this chart. What must the team know?",
    format: "read",
    proofKind: "writing",
    brief:
      "We make forecasting software for district heating and power grids. The operations team buys reserve power from our forecast every Monday. The chart shows last week: what we forecast and what really happened at each day's peak. What is the one thing the team must know from this chart? This is a synthetic example.",
    material: {
      kind: "text",
      title: "Last week: daily peak, forecast and actual (synthetic)",
      image: "/demo/chart-load-week.svg",
      body: [
        "Day   Coldest (°C)   Actual peak (MW)   Forecast peak (MW)",
        "Mon        -4              412                 409",
        "Tue        -6              425                 421",
        "Wed       -17              511                 466",
        "Thu       -19              529                 478",
        "Fri        -8              437                 431",
        "Sat        -5              398                 401",
        "Sun        -3              390                 392",
        "",
        "Note for the team: \"Mean error this week 2.1%. The model is ready for winter.\"",
      ].join("\n"),
    },
    deliverable: "Write the one thing the team must know, and why it matters, in a few sentences.",
    flaws: [
      {
        label: "the forecast that falls about 10% short at the peak on the two coldest days",
        cues: ["cold", "coldest", "wednesday", "thursday", "wed", "thu", "-17", "-19", "peak", "too low", "under", "466", "478", "45", "51", "short"],
      },
      {
        label: "a weekly average error that hides the peak misses",
        cues: ["mean", "average", "2.1", "hides", "overall", "ready for winter"],
      },
    ],
  },
  taster: {
    title: "Read one small chart",
    format: "read",
    proofKind: "writing",
    brief: "New sign-ups per month for an app (synthetic).",
    material: {
      kind: "text",
      title: "Sign-ups per month",
      body: [
        "Jan  120",
        "Feb  130",
        "Mar  125",
        "Apr  410   (free month offer)",
        "May  140",
      ].join("\n"),
    },
    deliverable: "What is the one thing you would tell the team, and why?",
    flaws: [
      {
        label: "a jump that came from a one-month offer and did not last",
        cues: ["april", "apr", "offer", "free", "may", "back", "did not last", "one month", "temporary"],
      },
    ],
  },
};
