import type { RoleTemplate } from "../role-template";

export const marketingSpecialist: RoleTemplate = {
  id: "marketing",
  title: "Marketing specialist",
  keywords: [
    "marketing", "marketer", "growth marketing", "digital marketing", "performance marketing",
    "campaign manager", "content marketing", "markkinointi", "markkinoija", "markkinointipäällikkö",
  ],
  skills: ["campaign-analysis", "metrics-definition", "experiment-design", "writing-clarity"],
  why: {
    "campaign-analysis": "Next quarter's budget follows this report, so the attribution has to hold up.",
    "experiment-design": "A fair comparison is cheaper than a quarter spent on the wrong channel.",
  },
  lookFor: {
    "campaign-analysis": "Questions how each sale was credited to a channel and proposes a fairer view.",
    "experiment-design": "Suggests a test that would show what the money actually changed.",
  },
  constraints: [
    "the budget for next quarter is cut by 30 percent",
    "you can run one test for four weeks",
    "the sales team counts a lead only after a first meeting",
    "the report must go to the board in a single slide",
  ],
  challenge: {
    title: "Review an AI-written campaign report",
    format: "review",
    brief:
      "We sell accounting software to small companies. An AI assistant wrote the summary of our autumn campaign from the ad platform exports. The board will use it to move next quarter's budget. Please read it before it goes out.",
    material: {
      kind: "text",
      title: "Autumn campaign report",
      body: [
        "Channel          Spend (EUR)   Sign-ups   Cost per sign-up",
        "Search ads        12 000        480        25",
        "Social ads         8 000        640        12.5",
        "Newsletter           500        210         2.4",
        "Total             20 500      1 330",
        "",
        "Attribution: last click, 1-day window.",
        "Sign-ups counted by each platform's own pixel.",
        "Newsletter sign-ups include people who were already trial users.",
        "",
        "Conclusion",
        "Social ads are twice as efficient as search. Move 6 000 EUR from search",
        "to social next quarter. The newsletter is the cheapest channel, so",
        "send it weekly instead of monthly.",
      ].join("\n"),
    },
    deliverable:
      "What would you change in this report before the board sees it, and why?",
    flaws: [
      {
        label: "sign-ups counted by each platform's own pixel, so one person can be counted twice",
        cues: ["pixel", "double count", "counted twice", "overlap", "1 330", "dedupl", "own pixel", "total"],
      },
      {
        label: "a 1-day last-click window that ignores longer decisions",
        cues: ["last click", "last-click", "1-day", "window", "attribution", "multi-touch", "first touch"],
      },
      {
        label: "newsletter sign-ups that include existing trial users",
        cues: ["newsletter", "existing", "trial users", "already", "new customers", "incremental"],
      },
    ],
  },
  taster: {
    title: "Read one campaign claim",
    format: "review",
    brief: "This line is going into a monthly update.",
    material: {
      kind: "text",
      title: "Monthly update",
      body: [
        "Our video ad reached 50 000 people in October.",
        "Sales grew 8% in October.",
        "So the video ad grew sales by 8%.",
      ].join("\n"),
    },
    deliverable: "What would you change before this goes out, and why?",
    flaws: [
      {
        label: "a sales increase credited to the ad without a comparison",
        cues: ["causation", "correlation", "cause", "other reasons", "season", "comparison", "control", "baseline"],
      },
    ],
  },
};
