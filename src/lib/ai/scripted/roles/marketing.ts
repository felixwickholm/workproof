import type { RoleTemplate } from "../role-template";

export const marketingSpecialist: RoleTemplate = {
  id: "marketing",
  title: "Marketing or communications specialist",
  level: "degree",
  keywords: [
    "marketing", "marketer", "growth marketing", "digital marketing", "performance marketing",
    "campaign manager", "content marketing", "communications specialist", "communications", "brand",
    "markkinointi", "markkinoija", "markkinointipäällikkö", "viestintä", "viestinnän asiantuntija",
    "influencer", "content creator", "youtuber", "social media manager", "sisällöntuottaja",
  ],
  skills: ["audience-insight", "campaign-analysis", "experiment-design", "writing-clarity"],
  cues: {
    "audience-insight": ["send a video on", "people send"],
    "campaign-analysis": ["past videos", "beyond the views"],
    "experiment-design": ["small test", "before we spend"],
  },
  why: {
    "audience-insight": "We have money for one video this month. It only works if the right people send it on.",
    "campaign-analysis": "Our last two videos tell us something about sharing, if we read the numbers right.",
    "experiment-design": "A small test before the money is spent is cheaper than a guess.",
  },
  lookFor: {
    "audience-insight": "Says who will share the video and what makes that person send it to a friend.",
    "campaign-analysis": "Uses the shares, not only the views, of the last two videos.",
    "experiment-design": "Suggests a cheap way to check the pick before the whole budget goes in.",
    "writing-clarity": "Gives the reason in a few plain sentences that a colleague could repeat.",
  },
  constraints: [
    "the budget drops to 500 euros",
    "the video has to work without sound",
    "the video goes out on the night before an exam week",
    "the sales team wants the game shown in the first two seconds",
  ],
  challenge: {
    minutes: 10,
    title: "Which video will more people share?",
    format: "choose",
    proofKind: "voice",
    brief:
      "We make a puzzle game for phones. This month we can make one short video for social media, and we have two ideas. Which one will more people share? This is a synthetic example.",
    material: {
      kind: "text",
      title: "What we know (synthetic)",
      body: [
        "Who we want to reach: students who play on the bus.",
        "Money: one video this month, 1 500 EUR.",
        "",
        "Our last two videos",
        "Video                            Views    Shares   Comments",
        "Studio trailer, polished, 30 s   41 000      120         35",
        "Team plays a level, phone, 20 s   9 000      610        240",
      ].join("\n"),
    },
    options: [
      {
        id: "a",
        title: "The big trailer",
        body: "A polished 30-second trailer with music and our logo at the end. It shows ten levels in bright colours, one after another. Text on screen: \"Out on 1 March.\"",
        image: "/demo/video-idea-a.svg",
      },
      {
        id: "b",
        title: "Beat my level",
        body: "A 15-second phone clip of a tester who misses level 12 by one move and laughs. Text on screen: \"Can you do it in fewer moves?\" with a link to that level.",
        image: "/demo/video-idea-b.svg",
      },
    ],
    deliverable: "Pick A or B, and say or write why more people will share it.",
    flaws: [
      {
        label: "the cheap phone video that was shared five times more than the polished one",
        cues: ["shares", "610", "120", "per view", "comments", "team plays", "phone video", "polished"],
      },
      {
        label: "what makes a viewer send the video on to someone",
        cues: ["challenge", "friend", "send", "beat", "fewer moves", "laugh", "fail", "dare", "tag", "relat"],
      },
    ],
  },
  taster: {
    title: "Pick one headline",
    format: "choose",
    proofKind: "writing",
    brief: "Two headlines for the same post about a game update.",
    material: {
      kind: "text",
      title: "The post",
      body: "A picture of the new level on a phone screen.",
    },
    options: [
      { id: "a", title: "Headline A", body: "New: 20 more levels." },
      { id: "b", title: "Headline B", body: "Level 31 beat our whole team. Can you do it?" },
    ],
    deliverable: "Which headline would you post, and why?",
    flaws: [
      {
        label: "a headline that invites a reply, so more people see the post",
        cues: ["question", "reply", "comment", "can you", "answer", "dare", "invite", "challenge"],
      },
    ],
  },
};
