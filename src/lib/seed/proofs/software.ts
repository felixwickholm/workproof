import type { SeedProof } from "../types";

/** Synthetic forecast, payment and project plan reviews for the software employers. */
export const SOFTWARE_PROOFS: SeedProof[] = [
  {
    id: "proof_fc_01",
    person: "ravi",
    challenge: "saarnivo-forecast",
    hoursAgo: 80,
    shareWithSimilar: true,
    answer: [
      "temp_next_hour is the measured temperature of the next hour. At forecast time we only have the weather forecast, so this feature leaks the future. Replace it with the forecast temperature issued before the prediction time.",
      "The shuffled split lets the model train on hours after the ones it predicts. Use a rolling, time-ordered backtest instead.",
      "I would also report the error per season, because winter peaks matter most to the operators.",
      "I relocate from Bengaluru in December, so I can start in January.",
    ].join("\n"),
    explainAnswers: [
      "The temperature leak is the largest, because temperature drives most of the load in winter.",
      "I would report a range from the backtest errors, for example the 10th and 90th percentile for each hour, and check that the real load falls inside it as often as it says.",
    ],
    decision: {
      companyId: "co-saarnivo",
      kind: "pass",
      feedback:
        "You found the temperature leak and explained it in one sentence our operators would follow. This role sits in our control room during the winter peak from the start of December, so we cannot take anyone who starts later. Your proof stays open to other employers.",
      hoursToReply: 2.5,
    },
  },
  {
    id: "proof_fc_02",
    person: "elsa",
    challenge: "saarnivo-forecast",
    hoursAgo: 50,
    shareWithSimilar: true,
    answer: [
      "MAPE divides by load, and some district hours are close to zero in summer nights, so a few hours can dominate the average. I would use MAE in MW, which the operators also understand.",
      "The split should be by time. Shuffling hourly data gives the model neighbouring hours from the future.",
      "I would show the forecast against actual load for one cold week, so the operations team can see where it misses.",
    ].join("\n"),
    explainAnswers: [
      "I started with the metric because the team will make its decision on that one number.",
      "Then the model can use only the weather forecast, not measured temperatures. I would backtest it with the forecasts that were known 36 hours before.",
    ],
    decision: {
      companyId: "co-saarnivo",
      kind: "pass",
      feedback:
        "Your point on the error metric and the plot for operators were useful. This role needs daily work in our control room during the winter peak, which starts this month, and we have already filled that shift. Your proof stays open to other employers.",
      hoursToReply: 4,
    },
  },
  {
    id: "proof_fc_03",
    person: "samuel",
    challenge: "saarnivo-forecast",
    hoursAgo: 14,
    shareWithSimilar: false,
    answer: [
      "Honestly I am more of a planner than a data scientist, but two things look off to me. The model sees the real temperature of the hour it predicts, which it cannot know in advance. And the data is shuffled before the split, so it learns from the future. I would ask the team to fix both before trusting the error number.",
    ].join("\n"),
    explainAnswers: [
      "I started with what the model can know at prediction time, because that is a question anyone can ask.",
      "I would give the operator the forecast with a band from past errors for each hour, so they see when it is unsure.",
    ],
    decision: {
      companyId: "co-saarnivo",
      kind: "pass",
      feedback:
        "You asked what the model can know at the time it predicts, which is the right first question. The role needs someone who can change the evaluation code from the first week, so it is not now. Your plain way of explaining it would help any team that works with operators.",
      hoursToReply: 1,
    },
  },
  {
    id: "proof_api_01",
    person: "daniel",
    challenge: "kivira-backend",
    hoursAgo: 40,
    shareWithSimilar: true,
    answer: [
      "The fetch has no timeout, so during a slow period requests pile up. Add an AbortSignal timeout of a few seconds.",
      "while (true) retries forever. Cap it at three attempts with backoff, and do not retry after the provider has accepted the charge.",
      "Because the app retries, the same order can be charged twice. Send an idempotency key based on orderId and validate amountCents and currency with a schema.",
      "I would add tests for the timeout path and for a repeated request with the same order.",
    ].join("\n"),
    explainAnswers: [
      "Without a timeout, every slow call to the provider holds a connection, and in a busy hour the whole endpoint stops. The double charge costs more, but the timeout is the quickest fix.",
      "Then I would keep our own table of order ids that were charged, and check it before calling the provider.",
    ],
    decision: {
      companyId: "co-kivira",
      kind: "meet",
      feedback:
        "You connected the app retries to the double charge, which is the incident we had last spring. We would like to meet and talk about our payment flow.",
      hoursToReply: 2,
      meeting: "accepted",
    },
  },
  {
    id: "proof_api_02",
    person: "oskari",
    challenge: "kivira-backend",
    hoursAgo: 8,
    shareWithSimilar: true,
    answer: [
      "Idempotency first: the mobile app retries slow requests, so one parcel can be charged twice. Require an Idempotency-Key header and store the result per key.",
      "Then the endless retry loop and the missing timeout.",
      "Small one: the error response returns the provider's raw message to the client, which can leak internal ids.",
    ].join("\n"),
    explainAnswers: [
      "Idempotency first because the money has already left the customer when we notice.",
      "The fix stays on the server: the endpoint ignores a second charge for the same order id, so the old app's retries do no harm.",
    ],
  },
  {
    id: "proof_pm_01",
    person: "hanna",
    challenge: "kivira-pm",
    hoursAgo: 20,
    shareWithSimilar: true,
    answer: [
      "1. The integration build starts in week 2, but API access only arrives in week 3, and nobody owns getting it. Name an owner and move the access request to week 1, before the build.",
      "2. 'Risks: none identified' will not reassure the customer. I would list the vendor access, the security review in week 6 and tester availability in week 7, each with an owner.",
      "3. There is no buffer before a fixed date. Move the security review earlier or add a spare week between testing and go-live.",
      "4. Monthly status email is too slow for an 8-week project. Weekly, short, with the open risks on top.",
    ].join("\n"),
    explainAnswers: [
      "The missing owner comes first, because without access the whole build waits and the date slips.",
      "Then the security review moves to week 5 and acceptance testing follows it, still before 2 March. I would book the security team this week.",
    ],
    decision: {
      companyId: "co-kivira",
      kind: "pass",
      feedback:
        "Thank you, the point on the vendor access owner was practical and the weekly status is what our customers ask for. This role leads the customer's on-site acceptance week in Tampere in March, and we have already agreed that week with another project lead. We hope to post a similar task in the spring.",
      hoursToReply: 3,
    },
  },
  {
    id: "proof_pm_02",
    person: "samuel",
    challenge: "kivira-pm",
    hoursAgo: 5,
    shareWithSimilar: false,
    answer: [
      "The plan looks fine in shape, but the order is off: the backend team cannot build the integration before the vendor gives API access in week 3.",
      "I would ask the vendor for a sandbox in week 1 and write down who chases it.",
      "Customer testers in week 7 should be confirmed now, not assumed.",
      "Samuel O., PMP, 6 yrs at Pajala Systems before I moved to Espoo",
    ].join("\n"),
    explainAnswers: [
      "The backend team would start building before they have API access, then wait, and the 2 March date would slip.",
      "Then the build starts a week later, and I would take the mobile alerts out of the pilot scope to win that week back.",
    ],
  },
];
