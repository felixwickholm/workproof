import type { SeedProof } from "../types";

/** Revontuli Games' video choice: four synthetic answers, two of them spoken. */
export const MARKETING_PROOFS: SeedProof[] = [
  {
    id: "proof_video_01",
    person: "thiago",
    challenge: "revontuli-video",
    hoursAgo: 110,
    shareWithSimilar: true,
    choice: "b",
    spoken: true,
    answer:
      "I pick B, Beat my level. Look at your own numbers: the team video on a phone got 610 shares from 9 000 views, the polished trailer got 120 from 41 000. That is about one share in fifteen views against one in three hundred. People do not share an ad, they share a dare. B asks a question, so every viewer who thinks they can do it in fewer moves sends it to a friend. Before we spend the 1 500, I would post two cheap versions of B for two days and keep the one with more shares per view.",
    thinkAloud: {
      transcript:
        "Okay, A looks great, honestly, it's the one my boss would pick. But wait, let me look at the table first. Forty-one thousand views, a hundred and twenty shares. And the phone one, nine thousand views and six hundred ten shares. So the cheap one gets shared way more per view. Hmm. Why? Because it's people, not a logo. B is a tester failing level twelve and laughing, and then a question. Can you do it in fewer moves. Yeah, that's a dare, you send that to your friend on the bus. We did this kind of test all the time at Metropolia in the media course. Okay, B, and test two cuts first.",
      seconds: 520,
    },
    explainAnswers: [
      "The shares per view, because views only tell us the ad money worked, and shares tell us people wanted their friends to see it.",
      "With 500 euros I would still make B: it is a phone clip, so the money goes on a small paid push to students instead of production.",
    ],
    spokenFollowUps: true,
    decision: {
      companyId: "co-revontuli",
      kind: "meet",
      points: [5, 5, 4, 4],
      feedback:
        "You read the shares per view, not the views, and you named why a dare gets sent on. The two-day test before spending the money is what we would do too. We would like to talk at the event.",
      hoursToReply: 4,
      meeting: "met",
      followUpAgreed: true,
    },
  },
  {
    id: "proof_video_02",
    person: "aino",
    challenge: "revontuli-video",
    hoursAgo: 75,
    shareWithSimilar: true,
    choice: "a",
    answer: [
      "A, the big trailer.",
      "It reached 41 000 people last time, more than four times the phone video. Students want something that looks like a real game, and a bright trailer with music gives the game a brand. B could look cheap, and a tester who fails might make people think the game is unfair.",
      "I would post A on the Friday before the launch, with the date in the first second.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "So which one. The trailer reached way more people, forty-one thousand. That's the number I'd show a manager. The phone one is nine thousand. Okay so, A wins on reach. B is kind of funny but someone failing, is that good for the game? Maybe people think it's too hard. Hmm, the shares are higher on the phone video, yeah, but views matter more for a launch I think. Okay, A, and put the date early. Out on the first of March.",
      seconds: 360,
    },
    explainAnswers: [
      "Reach first, because a launch needs as many people as possible to know the date.",
      "Without sound I would put the music beat into big text on screen and keep the date in the first second.",
    ],
    decision: {
      companyId: "co-revontuli",
      kind: "pass",
      points: [2, 3, 2, 4],
      feedback:
        "Your answer is clear and easy to follow, and the date in the first second is a good habit. You read the views and not the shares, and our question was which video people send on, where the phone video did five times more. This role starts with sharing, so it is not now.",
      hoursToReply: 2.5,
    },
  },
  {
    id: "proof_video_03",
    person: "chiamaka",
    challenge: "revontuli-video",
    hoursAgo: 40,
    shareWithSimilar: true,
    choice: "b",
    answer: [
      "B, Beat my level.",
      "Shares per view: trailer 120 of 41 000, team video 610 of 9 000. The rough phone clip was shared about twenty times more often for each view.",
      "B gives the viewer something to do: try level 12, then send it to the friend who always wins.",
      "Risk: if level 12 is too hard, people give up. I would check how many players finish it today before we post.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Let me put the two ideas next to each other. A, polished, logo at the end. B, a tester misses by one move. Now the old numbers. Shares column. One twenty versus six ten, but the views are so different, so divide. Hundred twenty over forty-one thousand is tiny. Six ten over nine thousand, that's almost seven percent. Wait, that's not twenty times... let me redo it. Point three percent and six point eight. Yes, about twenty times. Okay. B. One worry, if level twelve is brutal nobody beats it.",
      seconds: 450,
      screen: {
        kind: "video",
        src: "/demo/screen-videos.webm",
        poster: "/demo/screen-videos.jpg",
        seconds: 12,
        alt: "Screen recording of the two video ideas side by side. The cursor moves between them, stops on the shares column of the last two videos, then picks idea B.",
      },
    },
    explainAnswers: [
      "I started with shares per view, because a big view count can come from paid reach that nobody passes on.",
      "If the sales team wants the game in the first two seconds, I would open B on the level 12 board before the tester's face reacts.",
    ],
    decision: {
      companyId: "co-revontuli",
      kind: "hold",
      points: [4, 4, 3, 4],
      feedback:
        "You worked out shares per view and checked your own sum, and the worry about level 12 being too hard is a real one. We would have liked one cheap test before the money goes in. We will decide after the event.",
      hoursToReply: 2,
    },
  },
  {
    id: "proof_video_04",
    person: "sofia",
    challenge: "revontuli-video",
    hoursAgo: 8,
    shareWithSimilar: false,
    choice: "a",
    spoken: true,
    answer:
      "I would go with A. It looks professional, the music makes it feel big, and the logo at the end helps people remember the name. B is a bit random, and a tester who loses does not show the game at its most fun. I think students on the bus like things that look good and finished.",
    thinkAloud: {
      transcript:
        "Okay, two videos. A is the trailer, B is a phone clip. Um. I like A more, it looks like a real game. B, someone loses and laughs, I don't really get why that sells. The table, views and shares, okay, A had more views. So A. Music, logo, done. Actually maybe B is more fun, but no, I'll stay with A.",
      seconds: 260,
    },
    explainAnswers: [
      "Because a polished video shows the game is serious and worth downloading.",
      "With 500 euros I would make a shorter trailer from the game footage we already have.",
    ],
    spokenFollowUps: true,
    decision: {
      companyId: "co-revontuli",
      kind: "pass",
      points: [2, 2, 1, 3],
      feedback:
        "Thank you for a quick, honest answer. It did not use the shares in the table or say who would send the video on, and that is the heart of this job. It is not now, and we hope you try the next challenge with the numbers in hand.",
      hoursToReply: 1,
    },
  },
];
