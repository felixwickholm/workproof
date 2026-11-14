import type { SeedProof } from "../types";

/**
 * The feature-list cut shared by Tuulos Robotics and Kuulas Studio, and Kuulas Studio's booking screen.
 * Synthetic people and work.
 */
export const PRODUCT_AND_DESIGN_PROOFS: SeedProof[] = [
  {
    id: "proof_pm_01",
    person: "xiaoling",
    challenge: "pooled-product",
    hoursAgo: 90,
    shareWithSimilar: true,
    answer: [
      "Ships (14 of 16 days):",
      "1. Robot shows twice: 4 days. Nine tickets in a month means people stop trusting the screen.",
      "2. Excel export: 3 days. All three pilot warehouses asked.",
      "7. Pause all robots: 2 days. Two pilots asked, and it is a safety habit.",
      "3. Offline mode: 5 days. One pilot has weak signal and a date, 1 March.",
      "Waits: push alert (6 days, \"nice to have\"), dark mode and the animation, which nobody outside the team asked for.",
      "Two days stay free for testing. Next month I check one number: tickets about double robots should fall to zero.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Sixteen days. First the bug, four days, nine tickets. Then export, three, everybody wants it. That's seven. Push alert is six, hmm, it sounds important, a robot stops... no wait, the leads called it nice to have. Pause button, two days, two pilots, that's real. Nine. Offline mode five, fourteen. Okay, two days left, I keep them for testing. At Varastokulma Oy we shipped without a buffer once and lost a week. And how do I know it worked? Tickets about the double robot go to zero.",
      seconds: 600,
    },
    explainAnswers: [
      "The double robot fix first, because a screen people do not trust makes every other feature useless.",
      "Nothing changes, the export is already in. I would ask sales to check with me before the next promise, so the buffer stays.",
    ],
    decision: {
      companyId: "co-tuulos",
      kind: "meet",
      points: [5, 4, 4, 4],
      feedback:
        "Your cut fits the 16 days, keeps a buffer and gives one plain reason for each item. You also said how we would know next month that it worked. Let us talk at the event.",
      hoursToReply: 2,
      meeting: "accepted",
    },
  },
  {
    id: "proof_pm_02",
    person: "daniel",
    challenge: "pooled-product",
    hoursAgo: 55,
    shareWithSimilar: true,
    answer: [
      "Two weeks: the fix, the export, the push alert and the pause button. That is 15 days.",
      "The push alert matters most for safety, because a stopped robot blocks the aisle.",
      "Dark mode, the animation and offline mode wait. Offline mode is for one customer only.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Okay, sixteen days, list is twenty-seven. Fix, yes, four. Export, three. Push alert, six, I think that one's big, if a robot stops someone should know right away. That's thirteen. Pause, two, fifteen. One day left. Offline mode, only one warehouse, so it waits. Dark mode, no. Animation, no. Done, I think.",
      seconds: 330,
    },
    explainAnswers: [
      "The push alert, because a robot that stops without anyone knowing blocks the work for everyone.",
      "The export is already in my list, so I would keep it and drop the pause button to stay inside the days.",
    ],
    decision: {
      companyId: "co-tuulos",
      kind: "pass",
      points: [3, 2, 3, 2],
      feedback:
        "Your cut fits the days and you explained the push alert well. The two warehouse leads called it nice to have, while one pilot has a firm date for offline mode, and the plan leaves no time for testing. This role works closely with our pilot customers, so it is not now.",
      hoursToReply: 2,
    },
  },
  {
    id: "proof_pm_03",
    person: "nadia",
    challenge: "pooled-product",
    hoursAgo: 18,
    shareWithSimilar: false,
    answer: [
      "In: 1 (fix, 4 days), 2 (export, 3), 7 (pause, 2), 3 (offline, 5). Total 14.",
      "Out: 4, 5, 6.",
      "Why: items 1, 2, 3 and 7 come from customers or tickets. Items 4 and 6 come from inside the team. Item 5 is the biggest and the leads called it nice to have.",
      "I would tell marketing today that the animation waits, so they do not plan around it.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "I'm going to sort by who asked. Customers, tickets, those are one, two, three, seven. Inside the team, four and six. Five is in between, warehouse leads, but nice to have. Sum the first group. Four, three, five, two, fourteen. Fits. Hmm, should I squeeze in something for the last two days? No, nothing fits in two except... nothing. Fine. Oh, and someone has to tell marketing.",
      seconds: 400,
    },
    explainAnswers: [
      "Sorting by who asked, because a request from a customer with a date is a promise and a request from inside is a wish.",
      "I would ask both leads if the push alert is really nice to have. If they say a stopped robot blocks the aisle, it goes first in the next release.",
    ],
    decision: {
      companyId: "co-tuulos",
      kind: "hold",
      points: [4, 3, 3, 3],
      feedback:
        "You sorted the list by who asked, which made the cut quick to read, and telling marketing early is thoughtful. We missed a word on how you would know the cut was right. We will decide after the event.",
      hoursToReply: 2,
    },
  },
  {
    id: "proof_ux_01",
    person: "mariana",
    challenge: "kuulas-booking",
    hoursAgo: 92,
    shareWithSimilar: true,
    answer: [
      "1. Room names in words, with a small icon: \"Sauna 1\", \"Sauna 2\", \"Laundry A\". SAU-1 means nothing to a first-time resident.",
      "2. Move the price and the closing time up, next to the room: \"6 EUR, billed with the rent\" under the sauna, \"Open until 21:00\" under the laundry. Larger text, dark text on a light background, so older residents can read it.",
      "3. After booking, show a clear message: \"Sauna 1 is yours on Tuesday 19:00 to 20:00.\" with a button to add it to the calendar. Rename SUBMIT to \"Book this time\".",
      "I would test it with three residents in the lobby before the developers start.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Okay, I'm a resident, first time. Room. SAU-1, LAU-A... I'd guess sauna, but would my mother? No. So names. Date, time, fine. Apartment code, okay it says where to find it, good. Submit. And then... nothing, the form clears. Did it work? I'd call the caretaker. That's the big one. Oh and the grey text, I almost missed it, six euros. That should be next to the sauna, not at the bottom. Three changes: names, price up, a real confirmation.",
      seconds: 560,
    },
    explainAnswers: [
      "The message after booking, because without it people book twice or call the caretaker, which is what you want to stop.",
      "If the developers can change only the words this month, I would rename the rooms and the button and put the price in the room names: \"Sauna 1 (6 EUR)\".",
    ],
    decision: {
      companyId: "co-kuulas",
      kind: "meet",
      points: [4, 5, 4, 3],
      feedback:
        "You walked the screen as a first-time resident and found the places where people stop, with words we can ship. Thinking of older readers, with larger and darker text, fits the people who use this app. We would like to meet you.",
      hoursToReply: 2,
      meeting: "accepted",
    },
  },
  {
    id: "proof_ux_02",
    person: "iryna",
    challenge: "kuulas-booking",
    hoursAgo: 50,
    shareWithSimilar: true,
    answer: [
      "Three changes:",
      "- Show the rooms as two big buttons, Sauna and Laundry, then pick which one. Codes go away.",
      "- Replace SUBMIT with \"Book this time\". After booking show the time and a cancel link.",
      "- Put the apartment code first, so the app can show only the rooms in your own building.",
      "In my own building in Kivenlahti the laundry list is still on paper, and people write their flat number, not a code.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Rooms first. Codes, no. I would do two big buttons, Sauna, Laundry. Then the button at the end, submit is an office word. Book. And after it, nothing happens? That needs a message and a way to cancel. What else. The apartment code, it's after the time. I'd move it first, then you see only your rooms. Hmm, there's grey text at the bottom too, laundry ends at nine. I'll leave it, three changes is the task.",
      seconds: 480,
    },
    explainAnswers: [
      "The rooms first, because if the first choice is a code, many people stop on the first screen.",
      "With only words, the room codes become names in the list and SUBMIT becomes Book this time. The buttons wait for the next month.",
    ],
    decision: {
      companyId: "co-kuulas",
      kind: "hold",
      points: [4, 3, 4, 2],
      feedback:
        "Your room buttons and the message after booking would help many first-time users, and the cancel link is a good touch. You saw the grey text but left the price there, where people miss it. We will decide after the event.",
      hoursToReply: 3,
    },
  },
  {
    id: "proof_ux_03",
    person: "hodan",
    challenge: "kuulas-booking",
    hoursAgo: 20,
    shareWithSimilar: false,
    answer: [
      "1. Make the SUBMIT button green and bigger, so people can find the last step on a small phone.",
      "2. Add the logo of the housing company at the top, so residents trust that the app is really from their building.",
      "3. Change the room codes to names, for example Sauna 1 and Laundry A.",
    ].join("\n"),
    thinkAloud: {
      transcript:
        "Okay so the screen. The button is just text, I would make it bigger and green, people look for green. And there's no logo, it looks like it could be anything. Trust matters. Room codes, yes, those are confusing, names are better. That's three. Should I say more about why? Hmm. I think it's clear.",
      seconds: 280,
    },
    explainAnswers: [
      "The button, because it is the last step and people need to find it.",
      "Then I would skip the colour and the logo, and keep the room names and a button that says Book.",
    ],
    decision: {
      companyId: "co-kuulas",
      kind: "pass",
      points: [3, 2, 3, 2],
      feedback:
        "Naming the rooms in words is a change we will make. The bigger problems for a first-time user are the missing message after booking and the price in small grey text, and the answer did not say why each change helps. It is not now.",
      hoursToReply: 1.5,
    },
  },
];
