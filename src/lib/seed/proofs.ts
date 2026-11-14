import type { DecisionKind, MeetingStatus, Talent } from "@/lib/domain/types";
import type { SeedChallengeKey } from "./companies";

/**
 * Synthetic people and their work. Every name, contact and story here is invented.
 * Contacts use the reserved example.org domain and an unassigned number range.
 */
export interface SeedProof {
  id: string;
  talent: Talent;
  challenge: SeedChallengeKey;
  minutesAgo: number;
  shareWithSimilar: boolean;
  answer: string;
  explainAnswers: string[];
  decision?: {
    companyId: string;
    kind: DecisionKind;
    feedback: string;
    minutesAgo: number;
    meeting?: MeetingStatus;
  };
}

/**
 * The demo persona, Leila, is an ML engineer whose proof waits, undecided, in the first company's queue.
 * Talent ids are private keys: `buildSeed` replaces the placeholder ids below with random ones on every reset.
 */
const DEMO_TALENT_ID = "t_seed_01";

export const SEED_PROOFS: SeedProof[] = [
  {
    id: "proof_seed_3n",
    talent: { id: DEMO_TALENT_ID, name: "Leila Haddad", contact: "leila.haddad@example.org" },
    challenge: "tuulos-ml",
    minutesAgo: 55,
    shareWithSimilar: true,
    answer: [
      "1. Split by grasp attempt, not by frame. Each attempt has about 30 frames that look almost the same, so a random frame split puts near copies of the same grasp in train and test. The 97% is mostly the model recognising frames it has already seen. Use GroupShuffleSplit with the attempt id, or better, hold out whole days.",
      "2. The threshold is picked on the test set, so the reported number is tuned to that set. Pick it on a validation split and report the test result once.",
      "3. Accuracy hides the failures. With 4% drops, predicting 'held' every time already gives 96%. Report recall and precision on dropped grasps and pick the threshold from the cost of a drop versus a retry.",
      "In my MSc thesis at Aalto I had the same leak with sensor windows, so I would also check a few test frames by hand.",
      "Best, Leila",
    ].join("\n"),
    explainAnswers: [
      "The leak comes first because it inflates every other number. Until the split is fixed, the threshold and the metric are measured on the wrong data.",
      "I would label failed grasps first, since they are the rare class, and use the new labels only for validation.",
    ],
  },
  {
    id: "proof_seed_02",
    talent: { id: "t_seed_02", name: "Joonas Peltonen", contact: "+358 50 000 1102" },
    challenge: "tuulos-ml",
    minutesAgo: 190,
    shareWithSimilar: true,
    answer: [
      "The split is the main problem: frames from the same grasp end up in both sets. I would group by attempt id.",
      "I would also stop choosing the threshold on the test data. Add a validation set.",
      "Before release I would run the model in shadow mode on one robot for a week and compare its predictions with real drops.",
    ].join("\n"),
    explainAnswers: [
      "Shadow mode tells us how it behaves on new parcels without any risk to orders.",
      "With fewer labels I would still run shadow mode, because it labels itself from the robot logs.",
    ],
    decision: {
      companyId: "co-tuulos",
      kind: "meet",
      feedback: "You found the leak in the split and the shadow-mode idea is close to how we test on site. We would like to talk about rollout on our robots.",
      minutesAgo: 60,
      meeting: "invited",
    },
  },
  {
    id: "proof_seed_03",
    talent: { id: "t_seed_03", name: "Aino Mäkelä", contact: "aino.makela@example.org" },
    challenge: "tuulos-ml",
    minutesAgo: 300,
    shareWithSimilar: false,
    answer: [
      "The model class is not shown, so I cannot say if GraspNet is right for this data.",
      "I would add type hints and split the script into functions so it is easier to test.",
      "The threshold range could be finer than 19 steps.",
    ].join("\n"),
    explainAnswers: [
      "Readable code makes the next review faster.",
      "If the release date cannot move, I would only do the refactor after release.",
    ],
    decision: {
      companyId: "co-tuulos",
      kind: "pass",
      feedback: "Thank you for the clear write-up. This role starts with two weeks of model testing on our robots, so we are looking first at how the model was tested. Your notes on code structure would help any team's reviews.",
      minutesAgo: 120,
    },
  },
  {
    id: "proof_seed_04",
    talent: { id: "t_seed_04", name: "Ravi Menon", contact: "ravi.menon@example.org" },
    challenge: "saarnivo-forecast",
    minutesAgo: 30,
    shareWithSimilar: true,
    answer: [
      "temp_next_hour is the measured temperature of the next hour. At forecast time we only have the weather forecast, so this feature leaks the future. Replace it with the forecast temperature issued before the prediction time.",
      "The shuffled split lets the model train on hours after the ones it predicts. Use a rolling, time-ordered backtest instead.",
      "I would also report the error per season, because winter peaks matter most to the operators.",
    ].join("\n"),
    explainAnswers: [
      "The temperature leak is the largest, because temperature drives most of the load in winter.",
      "If the release date could not move, I would ship with the forecast temperature and the old model as a fallback.",
    ],
  },
  {
    id: "proof_seed_05",
    talent: { id: "t_seed_05", name: "Elsa Lindqvist", contact: "+358 40 000 2205" },
    challenge: "saarnivo-forecast",
    minutesAgo: 420,
    shareWithSimilar: true,
    answer: [
      "MAPE divides by load, and some district hours are close to zero in summer nights, so a few hours can dominate the average. I would use MAE in MW, which the operators also understand.",
      "The split should be by time. Shuffling hourly data gives the model neighbouring hours from the future.",
      "I would show the forecast against actual load for one cold week, so the operations team can see where it misses.",
    ].join("\n"),
    explainAnswers: [
      "I started with the metric because the team will make its decision on that one number.",
      "With less time I would keep MAE and the time split and skip the plots.",
    ],
    decision: {
      companyId: "co-saarnivo",
      kind: "pass",
      feedback: "Your point on the error metric and the plot for operators were useful. This role needs daily work in our control room during the winter peak, which starts this month, and we have already filled that shift. Your proof stays open to other employers.",
      minutesAgo: 240,
    },
  },
  {
    id: "proof_seed_06",
    talent: { id: "t_seed_06", name: "Oskari Laine", contact: "oskari.laine@example.org" },
    challenge: "pooled-data",
    minutesAgo: 80 * 60,
    shareWithSimilar: false,
    answer: [
      "Late readings: the job uses max(read_at) as the watermark, so a reading that arrives two hours late has an older read_at and is never loaded. Track an ingested_at column or use a lookback window with an upsert.",
      "Retries: the plain INSERT duplicates rows when the scheduler reruns a failed job. Add a unique key on meter_id and read_at and use ON CONFLICT DO NOTHING.",
    ].join("\n"),
    explainAnswers: [
      "Billing uses this table, so missing or double rows turn into wrong invoices.",
      "With half the time I would add the unique key first. It stops the double rows today.",
    ],
  },
  {
    id: "proof_seed_07",
    talent: { id: "t_seed_07", name: "Mei Tanaka", contact: "mei.tanaka@example.org" },
    challenge: "pooled-data",
    minutesAgo: 30 * 60,
    shareWithSimilar: true,
    answer: [
      "datetime.now() returns local Helsinki time, but read_at is most likely stored in UTC. Around the daylight saving change the window skips or repeats an hour. Use timezone-aware UTC everywhere.",
      "The insert is not idempotent. A retry after a partial failure loads the same rows twice. Use a merge on (meter_id, read_at).",
      "Late readings are lost because the watermark is the latest reading time. Load by arrival time instead.",
      "I would add a daily check that compares row counts per meter between raw and reporting.",
    ].join("\n"),
    explainAnswers: [
      "I listed the timezone first because it is silent: nothing fails, the numbers are just wrong twice a year.",
      "If billing needed the data within minutes, I would move the reconciliation check into the job itself.",
    ],
    decision: {
      companyId: "co-saarnivo",
      kind: "meet",
      feedback: "Your point on the timezone and the row count check is something we have wanted for a while. We would like to meet and walk through our pipelines together.",
      minutesAgo: 26 * 60,
      meeting: "met",
    },
  },
  {
    id: "proof_seed_08",
    talent: { id: "t_seed_08", name: "Daniel Okafor", contact: "daniel.okafor@example.org" },
    challenge: "kivira-backend",
    minutesAgo: 26 * 60,
    shareWithSimilar: true,
    answer: [
      "The fetch has no timeout, so during a slow period requests pile up. Add an AbortSignal timeout of a few seconds.",
      "while (true) retries forever. Cap it at three attempts with backoff, and do not retry after the provider has accepted the charge.",
      "Because the app retries, the same order can be charged twice. Send an idempotency key based on orderId and validate amountCents and currency with a schema.",
      "I would add tests for the timeout path and for a repeated request with the same order.",
    ].join("\n"),
    explainAnswers: [
      "The double charge is the change I would make first, because it costs customers money directly.",
      "If we could not add a dependency, I would validate the body by hand and keep the same checks.",
    ],
    decision: {
      companyId: "co-kivira",
      kind: "meet",
      feedback: "You connected the app retries to the double charge, which is the incident we had last spring. We would like to meet and talk about our payment flow.",
      minutesAgo: 20 * 60,
      meeting: "accepted",
    },
  },
  {
    id: "proof_seed_09",
    talent: { id: "t_seed_09", name: "Hanna Virta", contact: "hanna.virta@example.org" },
    challenge: "kivira-pm",
    minutesAgo: 40,
    shareWithSimilar: true,
    answer: [
      "1. The integration build starts in week 2, but API access only arrives in week 3, and nobody owns getting it. Name an owner and move the access request to week 1, before the build.",
      "2. 'Risks: none identified' will not reassure the customer. I would list the vendor access, the security review in week 6 and tester availability in week 7, each with an owner.",
      "3. There is no buffer before a fixed date. Move the security review earlier or add a spare week between testing and go-live.",
      "4. Monthly status email is too slow for an 8-week project. Weekly, short, with the open risks on top.",
    ].join("\n"),
    explainAnswers: [
      "The missing owner comes first, because without access the whole build waits and the date slips.",
      "If the customer moved the pilot a week earlier, I would cut the alerts to one screen and keep the security review.",
    ],
  },
  {
    id: "proof_seed_10",
    talent: { id: "t_seed_10", name: "Samuel Osei", contact: "samuel.osei@example.org" },
    challenge: "kivira-pm",
    minutesAgo: 6 * 60,
    shareWithSimilar: false,
    answer: [
      "The plan looks fine in shape, but the order is off: the backend team cannot build the integration before the vendor gives API access in week 3.",
      "I would ask the vendor for a sandbox in week 1 and write down who chases it.",
      "Customer testers in week 7 should be confirmed now, not assumed.",
    ].join("\n"),
    explainAnswers: [
      "I looked at dependencies first because that is where fixed dates usually break.",
      "With one backend developer away, I would drop the mobile alerts from the pilot scope and add them after go-live.",
    ],
    decision: {
      companyId: "co-kivira",
      kind: "pass",
      feedback: "Thank you, the point on the vendor sandbox was practical. This role leads the customer's on-site acceptance week in Tampere in March, and we have already agreed that week with another project lead. We hope to post a similar task in the spring.",
      minutesAgo: 3 * 60,
    },
  },
];
