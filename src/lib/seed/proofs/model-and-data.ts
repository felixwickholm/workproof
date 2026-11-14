import type { SeedProof } from "../types";

/**
 * Synthetic model and pipeline reviews. Tuulos Robotics has not answered for more than two days,
 * so its proofs show as feedback owed and open to Second look.
 */
export const MODEL_AND_DATA_PROOFS: SeedProof[] = [
  {
    id: "proof_ml_01",
    person: "leila",
    challenge: "tuulos-ml",
    hoursAgo: 160,
    shareWithSimilar: true,
    answer: [
      "1. Split by grasp attempt, not by frame. Each attempt has about 30 frames that look almost the same, so a random frame split puts near copies of the same grasp in train and test. The 97% is mostly the model recognising frames it has already seen. Use GroupShuffleSplit with the attempt id, or better, hold out whole days.",
      "2. The threshold is picked on the test set, so the reported number is tuned to that set. Pick it on a validation split and report the test result once.",
      "3. Accuracy hides the failures. With 4% drops, predicting 'held' every time already gives 96%. Report recall and precision on dropped grasps.",
      "In my MSc thesis at Aalto I had the same leak with sensor windows, so I would also check a few test frames by hand.",
      "Best, Leila",
    ].join("\n"),
    explainAnswers: [
      "The leak comes first because it inflates every other number. Until the split is fixed, the threshold and the metric are measured on the wrong data.",
      "I would label failed grasps first, since they are the rare class, and use the new labels only for validation.",
    ],
  },
  {
    id: "proof_ml_02",
    person: "joonas",
    challenge: "tuulos-ml",
    hoursAgo: 120,
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
  },
  {
    id: "proof_ml_03",
    person: "aino",
    challenge: "tuulos-ml",
    hoursAgo: 75,
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
  },
  {
    id: "proof_data_01",
    person: "oskari",
    challenge: "pooled-data",
    hoursAgo: 150,
    shareWithSimilar: false,
    answer: [
      "Late readings: the job uses max(read_at) as the watermark, so a reading that arrives two hours late has an older read_at and is never loaded. Track an ingested_at column or use a lookback window with an upsert.",
      "Retries: the plain INSERT duplicates rows when the scheduler reruns a failed job. Add a unique key on meter_id and read_at and use ON CONFLICT DO NOTHING.",
    ].join("\n"),
    explainAnswers: [
      "Billing uses this table, so missing or double rows turn into wrong invoices.",
      "With half the time I would add the unique key first. It stops the double rows today.",
    ],
    decision: {
      companyId: "co-saarnivo",
      kind: "pass",
      feedback:
        "Your fix for the late readings is clear and small enough to ship this week. The role also owns our timezone handling, which the review did not touch, and we chose to meet people who wrote about it. Thank you for the short, exact write-up.",
      hoursToReply: 7,
    },
  },
  {
    id: "proof_data_02",
    person: "mei",
    challenge: "pooled-data",
    hoursAgo: 110,
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
      feedback:
        "Your point on the timezone and the row count check is something we have wanted for a while. We would like to meet and walk through our pipelines together.",
      hoursToReply: 3,
      meeting: "met",
    },
  },
  {
    id: "proof_data_03",
    person: "kristjan",
    challenge: "pooled-data",
    hoursAgo: 22,
    shareWithSimilar: true,
    answer: [
      "three things, shortly:",
      "- watermark = max(read_at) -> late meters never load. use ingested_at.",
      "- INSERT without key, rerun = duplicates. add unique(meter_id, read_at) + upsert",
      "- no alert when 0 rows loaded. a meter vendor outage looks like a quiet night.",
      "I did almost the same pipeline at Viru Arvesti in Tallinn for smart meters, we lost a week of readings exactly like this before somebody noticed.",
    ].join("\n"),
    explainAnswers: [
      "The empty load is the one nobody notices, the other two at least show up in numbers.",
      "If Airflow was not allowed I would still keep the unique key, it works with any scheduler.",
    ],
  },
];
