import type { SeedProof } from "../types";

/** Saarnivo Grid's chart task and Tuulos Robotics' model test task. Synthetic people and work. */
export const DATA_PROOFS: SeedProof[] = [
  {
    id: "proof_chart_01",
    person: "samuel",
    challenge: "saarnivo-chart",
    hoursAgo: 125,
    shareWithSimilar: true,
    answer: [
      "The team must know that the forecast is too low on cold days.",
      "On Wednesday and Thursday, at -17 and -19 °C, the forecast peak is 45 and 51 MW below the actual peak. On the other days it is within a few MW.",
      "The 2.1% mean error hides this. I would not say the model is ready for winter until it is tested on more cold weeks.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "So two lines. Forecast is dashed. Monday, Tuesday, close. Wednesday... it drops away. Thursday too. Those are the blue columns, coldest days. Five eleven against four sixty-six, that's forty-five. And fifty-one on Thursday. Then Friday it's back. So on mild days it's fine and on cold days it's low. I'd want more cold weeks before saying ready for winter. Should I say why it matters? Hmm, I'll keep it short.",
      seconds: 420,
    },
    explainAnswers: [
      "I started with where the two lines part, because that is where the money is lost.",
      "If next week is even colder, I would warn the team to add a margin on top of the forecast for the morning peaks.",
    ],
    decision: {
      companyId: "co-saarnivo",
      kind: "pass",
      points: [4, 3, 3, 4],
      feedback:
        "You found the cold-day misses and said the average hides them. You did not say why those hours matter to the team that buys reserve power, and this role presents to them every Monday. It is not now, and with your consent we share your work with a company that hires for the same skills.",
      hoursToReply: 3,
    },
  },
  {
    id: "proof_chart_02",
    person: "mei",
    challenge: "saarnivo-chart",
    hoursAgo: 30,
    shareWithSimilar: true,
    answer: [
      "One thing: on the two coldest days the forecast is about 10% too low at the peak (466 vs 511 MW on Wednesday, 478 vs 529 on Thursday).",
      "Those are the hours you buy reserve power for, so this is the costly miss, not a small one.",
      "The 2.1% average is real but mostly made of mild hours. Cold days are rare in the history, so the model has seen few of them.",
      "Before winter: add a cold-day check to the weekly report and test on last winter's coldest week.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Okay, read the axis first, megawatts, three sixty to five sixty. Lines overlap Monday, Tuesday. Wednesday gap. Thursday bigger gap. Shaded, coldest days, of course. So the error isn't random, it follows temperature. Forty-five, fifty-one, about ten percent. And that's the peak, which is when reserve is bought. Hmm, is one week enough to say that? No, but it's enough to say don't call it ready. I'll suggest testing on last winter.",
      seconds: 510,
    },
    explainAnswers: [
      "The peak on a cold day is the most expensive hour, so a miss there costs more than the average shows.",
      "If the operations team reads only the first line, the first line is the 10% miss on cold days.",
    ],
    decision: {
      companyId: "co-saarnivo",
      kind: "meet",
      points: [5, 5, 4, 4],
      feedback:
        "You put the cold-day miss in the first line and said why it costs money. Asking whether the model learned from enough cold days is the question we ask ourselves. We would like to meet you at the event.",
      hoursToReply: 2,
      meeting: "invited",
    },
  },
  {
    id: "proof_chart_03",
    person: "oskari",
    challenge: "saarnivo-chart",
    hoursAgo: 12,
    shareWithSimilar: true,
    answer: [
      "The forecast misses the peak on Wednesday and Thursday by about 45 to 50 MW, and those are the coldest days.",
      "So the weekly average is too kind. The team should not read 2.1% as ready for winter.",
      "Next step: plot error against temperature for the whole year, not just this week.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Let me just hover over the points. Wednesday, actual five eleven, forecast four sixty-six. Thursday five twenty-nine, four seventy-eight. Wait, I'll highlight those two. Yes, it's the cold ones. The other days are like three or four off. So I'd say the average is too nice. I did my thesis at Aalto on heat demand, and cold snaps were always the problem. Plot error against temperature next.",
      seconds: 360,
      screen: {
        kind: "video",
        src: "/demo/screen-chart.webm",
        poster: "/demo/screen-chart.jpg",
        seconds: 12,
        alt: "Screen recording of the load chart. The cursor highlights Wednesday and Thursday, where the forecast line drops below the actual line.",
      },
    },
    explainAnswers: [
      "The two gaps were the only part of the chart that moved, so I looked there first.",
      "If the model cannot be retrained before January, the team should add a cold-day margin by hand.",
    ],
    decision: {
      companyId: "co-saarnivo",
      kind: "hold",
      points: [4, 4, 3, 3],
      feedback:
        "You marked the two cold days and proposed plotting error against temperature, which is a useful next step. You did not say what the miss means for the reserve power the team buys. We decide after the first talks at the event.",
      hoursToReply: 2,
    },
  },
  {
    id: "proof_ml_01",
    person: "oskari",
    challenge: "tuulos-ml",
    hoursAgo: 150,
    shareWithSimilar: true,
    answer: [
      "The bug is the split, lines 8 to 10: train_test_split with shuffle=True on frames.",
      "One grasp has about 30 frames, so frames of the same grasp land in both train and test. The model has almost seen the test grasps, and the 97% is too high.",
      "Fix: split by grasp attempt.",
      "  GroupShuffleSplit(test_size=0.2).split(X, y, groups=frames.attempt_id)",
      "Second: accuracy hides the 4% of grasps that fail. A model that always says \"held\" gets 96%. Report recall on dropped grasps.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Ninety-seven percent and four percent fail. Hmm, so always saying held is ninety-six. That's the first smell. Then the comment, thirty frames per grasp. And train test split on frames, shuffled. Yes, that's it, neighbouring frames are almost the same picture, one goes to train, one to test. Leak. So split by attempt. I'll write the GroupShuffleSplit line. And then the metric, recall on drops. Okay.",
      seconds: 450,
    },
    explainAnswers: [
      "With the leak, every other number is wrong, so it had to come first.",
      "If we could label only 200 more frames, I would spend them on dropped grasps, because those are rare.",
    ],
    decision: {
      companyId: "co-tuulos",
      kind: "meet",
      points: [5, 5, 4],
      feedback:
        "You named the split line, said why 30 frames per grasp break it and wrote the grouped split. Pointing out that always saying held gives 96% shows the metric problem in one sentence. Let us meet.",
      hoursToReply: 3,
      meeting: "met",
      followUpAgreed: true,
      hired: true,
    },
  },
  {
    id: "proof_ml_02",
    person: "kristjan",
    challenge: "tuulos-ml",
    hoursAgo: 95,
    shareWithSimilar: true,
    answer: [
      "Line 9, shuffle=True. Frames from one grasp attempt end up in both sets, so the test is not independent. Split by attempt instead.",
      "Expect the accuracy to drop when you fix it.",
      "I would also look at the data: are the October logs all from one warehouse? If yes, the model may not hold up in a new one.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Okay, sklearn, split, shuffle true. Frames, thirty per attempt. So, yeah, leakage. That's the bug. The fix is a group split. What else. The data is only October. Hmm, one month, one place maybe? I'd ask that. Accuracy, I could say something, but I'll keep to the split and the data. I worked on camera data at Kuurahalli Oy before, same thing happened there.",
      seconds: 300,
    },
    explainAnswers: [
      "If the team skipped this, they would ship a model that looks 97% right and fails on new grasps.",
      "If the warehouse adds a new parcel type next month, I would keep some of those parcels only for testing.",
    ],
    decision: {
      companyId: "co-tuulos",
      kind: "pass",
      points: [4, 4, 3],
      feedback:
        "You found the split quickly and asked a good question about where the October data comes from. You did not show the fixed line or say what accuracy hides. This role starts with on-site robot testing this month, so it is not now, and with your consent we share your work with a company hiring for the same skills.",
      hoursToReply: 4,
    },
  },
  {
    id: "proof_ml_03",
    person: "minh",
    challenge: "tuulos-ml",
    hoursAgo: 45,
    shareWithSimilar: false,
    answer: [
      "The problem is random_state=7. With a fixed seed the result is always the same split, so the 97% could be luck.",
      "Run the test with 5 different seeds and report the average.",
      "Also use a confusion matrix instead of only accuracy.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Random state seven. That's fixed, so every run gives the same split. Could be a lucky split. Hmm, is that a bug though? I think so, kind of. Let me look at the rest. Model fit, predict, accuracy. Accuracy alone is not great for this, a confusion matrix shows more. Okay, so seeds and confusion matrix. The shuffle, that's normal I think, everyone shuffles.",
      seconds: 260,
    },
    explainAnswers: [
      "A single split can hide how much the result moves, so I wanted several.",
      "If the release date cannot move, I would at least add the confusion matrix before Monday.",
    ],
    decision: {
      companyId: "co-tuulos",
      kind: "pass",
      points: [2, 2, 3],
      feedback:
        "The confusion matrix is a good idea for a rare failure. The fixed seed is not the bug: the split puts frames of the same grasp in both sets, so several seeds would all give the same high number. For this role we need that leak spotted, so it is not now.",
      hoursToReply: 2,
    },
  },
  {
    id: "proof_ml_04",
    person: "leila",
    challenge: "tuulos-ml",
    hoursAgo: 22,
    shareWithSimilar: true,
    answer: [
      "Bug: the split on line 8. It splits frames, but a grasp is about 30 frames, so the same grasp is in train and test.",
      "Fix: split on attempt_id so all frames of one grasp stay together.",
      "Then the 97% will fall, maybe a lot. Report how many dropped grasps the model catches, since only 4% fail.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Okay so the data is frames. Thirty frames per attempt. And then... split on frames. Wait, no, first I thought the problem is the model, but no, the split. Same grasp on both sides. That inflates it. So split by attempt. I'm not sure the column is called attempt id, I'll just call it that. Then the metric. Only four percent fail, so accuracy is lazy here. Count the caught drops.",
      seconds: 380,
    },
    explainAnswers: [
      "The split decides what every other number means, so I started there.",
      "If the model has to run on the robot's own processor, I would test speed too, but only after the split is right.",
    ],
    decision: {
      companyId: "co-tuulos",
      kind: "hold",
      points: [4, 3, 4],
      feedback:
        "You found the split and kept all frames of one grasp together, and you named the right thing to count. We would like to see more on the data itself before we decide, so we keep your work while we talk with people at the event.",
      hoursToReply: 3,
    },
  },
  {
    id: "proof_ml_05",
    person: "johan",
    challenge: "tuulos-ml",
    hoursAgo: 5,
    shareWithSimilar: false,
    answer: [
      "The bug is the split: train_test_split(..., shuffle=True) on frames.",
      "About 30 frames come from one grasp, so frames of the same grasp land in both train and test. The model has seen almost the same picture before, and the 97% is too high.",
      "Fix: split by grasp attempt, for example GroupShuffleSplit with groups=frames.attempt_id.",
      "I would also report recall on the dropped grasps, since 4% failures hide inside a 97% accuracy.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Okay, imports, load frames, thirty frames per attempt, noted. Then the split, shuffle true, random state seven. Hmm, the random state is fine, that's not it. Wait, thirty frames per attempt and a random split on frames. So one grasp ends up on both sides. That's the leak. The model just remembers the grasp. Right, so group by attempt. And accuracy, ninety-seven, with four percent drops, that hides the drops anyway.",
      seconds: 360,
    },
    explainAnswers: [
      "The split first, because every number after it is measured on frames the model has already seen.",
      "Then I would label the frames from the attempts that failed first, because those are the ones the test needs most.",
    ],
  },
];
