import type { RoleTemplate } from "../role-template";

export const cloudArchitect: RoleTemplate = {
  id: "cloud-architect",
  title: "Cloud architect",
  level: "degree",
  keywords: [
    "cloud architect", "solution architect", "solutions architect", "software architect", "enterprise architect", "it architect", "cloud architecture", "aws",
    "azure", "gcp", "serverless", "pilviarkkitehti", "pilviarkkitehtuuri", "ratkaisuarkkitehti",
  ],
  skills: ["cloud-architecture", "architecture-tradeoffs", "error-handling", "security-thinking", "stakeholder-communication"],
  why: {
    "cloud-architecture": "This design sets our hosting cost and failure behaviour for the next few years.",
    "architecture-tradeoffs": "Every option buys something and pays for it somewhere else, and the proposal should say where.",
  },
  lookFor: {
    "cloud-architecture": "Checks single points of failure, data location and running cost with rough numbers.",
    "architecture-tradeoffs": "States what each change gains and costs, and when the choice should be revisited.",
  },
  constraints: [
    "the monthly cloud budget was capped at 3,000 euros",
    "customer data had to stay inside the EU",
    "the team had one person on call",
    "traffic doubled during the first week of each month",
  ],
  challenge: {
    minutes: 15,
    title: "Review an AI-drafted architecture proposal",
    format: "fix",
    proofKind: "plan",
    brief:
      "We are moving our meter-reading service to the cloud. A teammate asked an AI assistant to draft the proposal below for the steering group on Thursday. Readings come from 40,000 devices every 15 minutes, and billing depends on them. Please review it before it goes out.",
    material: {
      kind: "text",
      title: "Proposal: meter-reading ingestion in the cloud",
      body: [
        "Goal: receive readings from 40,000 meters every 15 minutes and store them for billing.",
        "",
        "1. Devices send readings over HTTPS to a single virtual machine running our ingestion API.",
        "2. The API writes each reading straight into the billing database.",
        "3. The database runs in one availability zone to keep costs down.",
        "4. Nightly backups are copied to a storage bucket in the same region.",
        "5. Devices that get an error simply drop the reading and send the next one.",
        "",
        "Cost estimate: about 900 euros per month.",
        "Scaling: if load grows, we move to a larger virtual machine.",
        "Security: the API is protected by a shared key that is built into the device firmware.",
        "",
        "Decision needed: approve the design so we can start the migration next sprint.",
      ].join("\n"),
    },
    deliverable:
      "What would you change before this goes to the steering group, and why? List the changes in order of importance.",
    flaws: [
      {
        label: "the single virtual machine and single zone as points of failure",
        cues: ["single point", "one vm", "single vm", "virtual machine", "availability zone", "one zone", "multi-az", "redundan", "failover", "load balancer"],
      },
      {
        label: "readings dropped on error instead of being buffered",
        cues: ["drop", "dropped", "lost", "buffer", "queue", "retry", "store and forward", "data loss", "billing gap"],
      },
      {
        label: "one shared key built into all device firmware",
        cues: ["shared key", "same key", "firmware", "per-device", "per device", "certificate", "rotate", "rotation", "credential"],
      },
    ],
  },
  taster: {
    title: "Spot the problem in a backup plan",
    format: "fix",
    proofKind: "writing",
    brief: "An AI assistant drafted this backup plan for a customer database.",
    material: {
      kind: "text",
      title: "Backup plan",
      body: [
        "Backups run every night at 02:00.",
        "They are stored in the same account and region as the database.",
        "Backups are kept for 30 days.",
        "We will restore from backup if the database is lost.",
      ].join("\n"),
    },
    deliverable: "What is missing from this plan that would matter on the day you need it?",
    flaws: [
      {
        label: "no restore test",
        cues: ["restore test", "test the restore", "tested", "never tested", "practice", "drill", "verify", "recovery time"],
      },
    ],
  },
};
