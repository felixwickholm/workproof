import type { ChoiceOption, ProofKind, TaskFormat } from "@/lib/domain/types";
import type { SkillId } from "@/lib/skills/vocabulary";

/**
 * A task a company wrote with its own situation and material. The library role named in `need` still sets the
 * template, so follow-up questions and the reviewer notes come from the same place as a drafted task.
 */
export interface SeedTask {
  title: string;
  format: TaskFormat;
  proofKind: ProofKind;
  minutes: number;
  /** 3 to 5 core skills from the shared list, most important first. */
  skills: readonly SkillId[];
  brief: string;
  material: { kind: "text"; title: string; body: string };
  deliverable: string;
  options?: readonly [ChoiceOption, ChoiceOption];
}

export interface ExtraSeedChallenge {
  key: string;
  companyIds: readonly string[];
  daysBeforeEvent: number;
  need: string;
  places?: number;
  task: SeedTask;
}

/**
 * More synthetic challenges from the other Espoo companies at the event, so the job seeker's list looks like a
 * real listing page. Every company, number and situation is invented.
 */
export const EXTRA_CHALLENGES = [
  {
    key: "lumo-churn",
    companyIds: ["co-lumo"],
    daysBeforeEvent: 6,
    need: "Data scientist for retail customer models",
    task: {
      title: "Check a churn model before the client sees it",
      format: "read",
      proofKind: "writing",
      minutes: 12,
      skills: ["ml-evaluation", "data-quality", "statistical-reasoning", "stakeholder-communication"],
      brief:
        "We built a model for a grocery chain that flags loyalty customers likely to stop shopping. A teammate wrote the summary below for the client meeting on Thursday. Read it as the client would, and tell us what you would change before it goes out. This is a synthetic example.",
      material: {
        kind: "text",
        title: "Model summary for the client (synthetic)",
        body: [
          "Accuracy on the test set: 94%.",
          "Customers who left in the test period: 6%.",
          "Test set: the same 12 months the model learned from, a random 20% of rows.",
          "Signal with the most weight: 'days since last visit'.",
          "The 1 000 customers with the highest risk: 410 really left.",
          "Plan: send all flagged customers a 10 EUR voucher in January.",
        ].join("\n"),
      },
      deliverable: "Write the three changes you would make to the summary, most important first.",
    },
  },
  {
    key: "lumo-assistant",
    companyIds: ["co-lumo"],
    daysBeforeEvent: 5,
    need: "AI engineer for an LLM support assistant",
    task: {
      title: "Test a store assistant's answers",
      format: "fix",
      proofKind: "writing",
      minutes: 10,
      skills: ["llm-evaluation", "prompt-design", "risk-sense", "writing-clarity"],
      brief:
        "Our client's store app has an AI assistant that answers questions about opening hours, returns and products. Before launch we tried it on five real questions. Read the answers and tell us which ones you would not let customers see, and what you would change in the instructions. This is a synthetic example.",
      material: {
        kind: "text",
        title: "Five test answers (synthetic)",
        body: [
          "Q: Is the Tapiola store open on Sunday? A: Yes, 10 to 18.",
          "Q: Can I return opened coffee? A: Yes, any product can be returned within 30 days.",
          "Q: Is this cereal gluten-free? A: It probably is, most oat products are.",
          "Q: Where is my order 4471? A: I cannot see orders. Please call customer service.",
          "Q: Which is cheaper, brand A or B? A: Brand B is 0.40 EUR cheaper per kilo.",
          "Instructions now: 'Be helpful and always give an answer.'",
        ].join("\n"),
      },
      deliverable: "Name the answers you would block and the one change to the instructions you would make first.",
    },
  },
  {
    key: "kajo-visit",
    companyIds: ["co-kajo"],
    daysBeforeEvent: 7,
    need: "UX designer for a home-care nurse app",
    task: {
      title: "Simplify the nurse's visit screen",
      format: "make",
      proofKind: "design",
      minutes: 15,
      skills: ["interaction-design", "accessibility", "user-research", "writing-clarity"],
      brief:
        "Home-care nurses open our app at the door of each visit. They have about 20 minutes per visit, often wear gloves, and read the screen standing up. Nurses tell us the visit screen shows too much. Sketch or describe a simpler first screen, and say what you would ask three nurses to check it. This is a synthetic example.",
      material: {
        kind: "text",
        title: "What the visit screen shows now (synthetic)",
        body: [
          "Patient name, address, door code.",
          "All 14 medicines, in the order they were added.",
          "Last 10 visit notes, newest last.",
          "Allergies, in grey text at the bottom.",
          "Buttons: Start visit, Edit plan, Call doctor, Print, Share, Settings.",
          "Nurses say they scroll on most visits to find today's medicines.",
        ].join("\n"),
      },
      deliverable: "Describe or sketch the first screen in up to eight lines, and list what you would ask the nurses.",
    },
  },
  {
    key: "kajo-notes",
    companyIds: ["co-kajo"],
    daysBeforeEvent: 5,
    need: "Backend developer for patient visit notes",
    task: {
      title: "Spot the risks in a visit-notes change",
      format: "fix",
      proofKind: "writing",
      minutes: 10,
      skills: ["api-design", "security-thinking", "error-handling", "technical-explanation"],
      brief:
        "A teammate wants to let nurses save visit notes offline and send them when the tablet is online again. The plan is below. Patient data is sensitive, and two nurses sometimes visit the same patient on the same day. Tell us what you would change before we build it. This is a synthetic example.",
      material: {
        kind: "text",
        title: "The plan (synthetic)",
        body: [
          "1. Notes are saved on the tablet as plain text files.",
          "2. When online, the app sends all saved notes to POST /notes.",
          "3. The server keeps the note that arrives last for each patient and day.",
          "4. If sending fails, the app tries again every 5 seconds, forever.",
          "5. Notes are deleted from the tablet after the first try.",
        ].join("\n"),
      },
      deliverable: "List the changes you would make, most important first, with one line on why for each.",
    },
  },
  {
    key: "routa-late",
    companyIds: ["co-routa"],
    daysBeforeEvent: 8,
    need: "Data analyst for delivery performance",
    task: {
      title: "Find why deliveries run late on Tuesdays",
      format: "read",
      proofKind: "writing",
      minutes: 12,
      skills: ["data-quality", "sql", "data-visualisation", "stakeholder-communication"],
      brief:
        "A grocery customer says our routes run late every Tuesday. The weekly numbers are below. Our operations lead wants one clear finding to take to the customer on Friday. Tell us what you see, what you would check next in the data, and how you would show it. This is a synthetic example.",
      material: {
        kind: "text",
        title: "Deliveries late by more than 15 min, last 6 weeks (synthetic)",
        body: [
          "Mon 4%   Tue 17%   Wed 5%   Thu 6%   Fri 8%",
          "Tuesday stops per van: 31 (other days 24 to 26).",
          "Tuesday is the only day the Kera depot also loads frozen goods.",
          "Van departure, Tuesday: 7:40 on average (other days 7:05).",
          "Two weeks have no Tuesday data from 6 vans: GPS units were swapped.",
        ].join("\n"),
      },
      deliverable: "Write the finding in three sentences, the next check, and the chart you would show.",
    },
  },
  {
    key: "routa-feature",
    companyIds: ["co-routa"],
    daysBeforeEvent: 6,
    need: "Product manager for the driver app",
    task: {
      title: "Choose the next feature for van drivers",
      format: "choose",
      proofKind: "writing",
      minutes: 8,
      skills: ["prioritisation", "customer-discovery", "metrics-definition", "stakeholder-communication"],
      brief:
        "We have one team for six weeks and two good ideas for the driver app. Pick one, say why, and say how we would know in a month that it worked. This is a synthetic example.",
      material: {
        kind: "text",
        title: "What we know (synthetic)",
        body: [
          "900 drivers use the app every morning.",
          "Support tickets last month: 140 about parking, 35 about photos.",
          "Two big customers renew their contracts in the spring.",
        ].join("\n"),
      },
      options: [
        {
          id: "a",
          title: "A: Parking spot hints",
          body: "Show where drivers parked before at each stop. Drivers asked for it, and it could save 2 to 3 minutes per stop in the city.",
        },
        {
          id: "b",
          title: "B: Proof-of-delivery photos",
          body: "Let drivers take a photo at the door. One big customer asked for it in their renewal talks and wants it by March.",
        },
      ],
      deliverable: "Pick A or B, give your reason, and name the number you would watch.",
    },
  },
  {
    key: "sointu-dpa",
    companyIds: ["co-sointu"],
    daysBeforeEvent: 7,
    need: "Lawyer for data protection contracts",
    task: {
      title: "Review a data processing agreement",
      format: "fix",
      proofKind: "writing",
      minutes: 12,
      skills: ["contract-review", "compliance", "risk-management", "writing-clarity"],
      brief:
        "Our client, a small HR software company, got this data processing agreement from a large customer. The client signs on Monday and asked us which clauses to push back on. Read the extract and write a short note the client can understand without a lawyer. This is a synthetic example.",
      material: {
        kind: "text",
        title: "Extract from the agreement (synthetic)",
        body: [
          "4.1 The processor may use any subprocessor without notice.",
          "5.2 Personal data may be stored in any country.",
          "6.1 The processor reports a data breach within 30 days.",
          "8.3 The processor's liability has no upper limit.",
          "9.1 On termination, the processor keeps the data for its own analytics.",
        ].join("\n"),
      },
      deliverable: "Write a short note to the client naming the clauses to change, most important first.",
    },
  },
  {
    key: "paju-survey",
    companyIds: ["co-paju"],
    daysBeforeEvent: 6,
    need: "HR specialist for staff survey analysis",
    task: {
      title: "Read a staff survey and pick one action",
      format: "read",
      proofKind: "writing",
      minutes: 10,
      skills: ["data-quality", "stakeholder-communication", "prioritisation", "writing-clarity"],
      brief:
        "A customer of ours, a software company of 120 people, ran its first staff survey in our app. The CEO wants one action for the spring, not ten. Read the results and write what you would tell the CEO. This is a synthetic example.",
      material: {
        kind: "text",
        title: "Survey results, 1 to 5 (synthetic)",
        body: [
          "Answered: 64 people. The company has 120.",
          "I know what is expected of me: 4.1",
          "I get useful feedback on my work: 2.6",
          "I would recommend this workplace: 3.9",
          "Support team (18 people, 4 answered): workload 1.8",
          "Comments mentioning 'one-to-one': 23",
        ].join("\n"),
      },
      deliverable: "Write a note to the CEO of up to six sentences with one action and how you would follow it up.",
    },
  },
  {
    key: "paju-launch",
    companyIds: ["co-paju"],
    daysBeforeEvent: 5,
    need: "Marketing specialist for a product launch",
    task: {
      title: "Plan the launch email for a new feature",
      format: "make",
      proofKind: "writing",
      minutes: 12,
      skills: ["audience-insight", "writing-clarity", "experiment-design", "campaign-analysis"],
      brief:
        "We are launching one-to-one notes: managers and their team members keep shared notes for their regular talks. We will email 3 000 HR managers who already use our onboarding tool. Write the subject line and the first three sentences, and say how you would test it before sending to everyone. This is a synthetic example.",
      material: {
        kind: "text",
        title: "Last three emails (synthetic)",
        body: [
          "'New in Paju: onboarding templates' opened 31%, clicked 2.1%.",
          "'Your onboarding report for May' opened 48%, clicked 6.4%.",
          "'Paju spring webinar' opened 22%, clicked 0.9%.",
          "Customers say managers, not HR, run the one-to-ones.",
        ].join("\n"),
      },
      deliverable: "Write the subject line, three sentences, and a short test plan.",
    },
  },
  {
    key: "kaste-drift",
    companyIds: ["co-kaste"],
    daysBeforeEvent: 8,
    need: "Hardware test engineer for water sensors",
    task: {
      title: "Find why a water sensor drifts",
      format: "read",
      proofKind: "writing",
      minutes: 12,
      skills: ["test-strategy", "embedded-constraints", "scientific-reasoning", "technical-explanation"],
      brief:
        "Our oxygen sensors in two fish farms show readings that slowly rise over three weeks, then jump back after cleaning. A field engineer sent the notes below. Tell us what you think is going on, and the test you would run first on the bench to check it. This is a synthetic example.",
      material: {
        kind: "text",
        title: "Field notes (synthetic)",
        body: [
          "Reading rises about 0.1 mg/l per day after cleaning.",
          "Sensors in the lab tank: no drift over 6 weeks.",
          "Farm water: 12 °C, lots of algae in summer.",
          "Drift is faster in July than in October.",
          "Firmware update in June changed the temperature correction.",
          "Battery voltage stays the same all month.",
        ].join("\n"),
      },
      deliverable: "Write what you think causes it, the bench test you would run first, and what result would prove you wrong.",
    },
  },
  {
    key: "kaste-pilot",
    companyIds: ["co-kaste"],
    daysBeforeEvent: 4,
    need: "Business analyst for pilot investments",
    task: {
      title: "Pick which pilot to fund this spring",
      format: "choose",
      proofKind: "writing",
      minutes: 10,
      skills: ["budget-analysis", "risk-management", "prioritisation", "stakeholder-communication"],
      brief:
        "We have 60 000 EUR for one pilot this spring. Pick one, say why, and say what would make you stop it halfway. This is a synthetic example.",
      material: {
        kind: "text",
        title: "Budget (synthetic)",
        body: [
          "Pilot budget: 60 000 EUR, spring only.",
          "Our sales team has 3 people, all in Finland.",
        ].join("\n"),
      },
      options: [
        {
          id: "a",
          title: "A: City water plant in Finland",
          body: "Cost 45 000 EUR. A public buyer: if it works, a tender for 30 plants in 2028. Slow decisions, and the plant asks for weekly reports.",
        },
        {
          id: "b",
          title: "B: Fish farm group in Norway",
          body: "Cost 58 000 EUR. A private buyer with 40 farms who could order in the autumn. Needs a sensor that works in salt water, which we have tested only in the lab.",
        },
      ],
      deliverable: "Pick A or B, give your reason, and name the sign that would make you stop it.",
    },
  },
  {
    key: "kuura-forecast",
    companyIds: ["co-kuura"],
    daysBeforeEvent: 7,
    need: "Accountant for cash flow forecasts",
    task: {
      title: "Fix a cash-flow forecast before a loan decision",
      format: "fix",
      proofKind: "writing",
      minutes: 12,
      skills: ["budget-analysis", "bookkeeping-accuracy", "data-quality", "stakeholder-communication"],
      brief:
        "A small Espoo bakery asked us for a 40 000 EUR loan. Our tool built the cash-flow forecast below from its accounting data. Our credit team decides tomorrow. Find what is wrong in the forecast and tell the credit team what it means for the loan. This is a synthetic example.",
      material: {
        kind: "text",
        title: "Forecast, next three months, EUR (synthetic)",
        body: [
          "Month        In       Out      Net",
          "December   62 000   48 000   +14 000",
          "January    62 000   48 000   +14 000",
          "February   62 000   48 000   +14 000",
          "Note: 'In' is the average of the last 12 months.",
          "Last December the bakery sold 95 000; last January 41 000.",
          "VAT for Q4, about 9 000, is due in February.",
          "Loan payment of 3 500 a month is not in 'Out'.",
        ].join("\n"),
      },
      deliverable: "List the problems, most important first, and say in two sentences what the credit team should know.",
    },
  },
  {
    key: "kuura-login",
    companyIds: ["co-kuura"],
    daysBeforeEvent: 5,
    need: "Security engineer for customer login",
    task: {
      title: "Find the risks in a new login flow",
      format: "read",
      proofKind: "writing",
      minutes: 10,
      skills: ["threat-modelling", "security-thinking", "risk-management", "technical-explanation"],
      brief:
        "Customers log in to see their loans and sign new ones. The team designed a faster login, described below. It goes to a pilot group of 200 customers next month. Tell us the risks you see and what you would change first. This is a synthetic example.",
      material: {
        kind: "text",
        title: "The new login (synthetic)",
        body: [
          "1. The customer types their email.",
          "2. We send a link that logs them in. The link works for 7 days.",
          "3. The same link can be used many times.",
          "4. After login, the customer can sign a loan with one click.",
          "5. Failed links are not logged.",
        ].join("\n"),
      },
      deliverable: "List the risks in order, and the first change you would make to each.",
    },
  },
  {
    key: "pilvi-outage",
    companyIds: ["co-pilvi"],
    daysBeforeEvent: 8,
    need: "DevOps engineer for incident reviews",
    task: {
      title: "Write up last night's outage for the customer",
      format: "read",
      proofKind: "writing",
      minutes: 12,
      skills: ["incident-response", "observability", "stakeholder-communication", "writing-clarity"],
      brief:
        "Last night a customer's web shop was down for 47 minutes. The on-call log is below. The customer's CTO wants a short note by noon: what happened, why, and what we change. Write it in plain words, without blame. This is a synthetic example.",
      material: {
        kind: "text",
        title: "On-call log (synthetic)",
        body: [
          "22:58 Certificate on the shop's load balancer expires.",
          "23:01 Customers see a browser warning. No alert fires.",
          "23:31 The customer's own support calls our desk.",
          "23:38 On-call engineer finds the expired certificate.",
          "23:45 New certificate installed by hand.",
          "Auto-renewal had failed for 30 days. The failure went to an old mailbox.",
        ].join("\n"),
      },
      deliverable: "Write the note to the CTO in up to eight sentences.",
    },
  },
  {
    key: "pilvi-cost",
    companyIds: ["co-pilvi"],
    daysBeforeEvent: 4,
    need: "Cloud architect for cost reduction",
    task: {
      title: "Cut a cloud bill without losing uptime",
      format: "choose",
      proofKind: "writing",
      minutes: 10,
      skills: ["cloud-architecture", "architecture-tradeoffs", "risk-management", "stakeholder-communication"],
      brief:
        "A customer must cut its cloud bill by 30% from January and cannot accept more downtime. Pick one plan, say why, and say what you would watch in the first month. This is a synthetic example.",
      material: {
        kind: "text",
        title: "The bill now (synthetic)",
        body: [
          "Total 18 000 EUR a month.",
          "Servers 11 000, database 4 000, storage and traffic 3 000.",
          "Night-time load is 15% of daytime.",
        ].join("\n"),
      },
      options: [
        {
          id: "a",
          title: "A: Scale servers down at night",
          body: "Saves about 5 500 EUR a month. Needs two weeks of work and a test of how fast servers come back in the morning rush.",
        },
        {
          id: "b",
          title: "B: Move the database to a smaller plan",
          body: "Saves about 2 400 EUR a month and takes two days. The smaller plan has no standby copy in a second data centre.",
        },
      ],
      deliverable: "Pick A or B, give your reason, and name what you would watch in the first month.",
    },
  },
  {
    key: "revontuli-level",
    companyIds: ["co-revontuli"],
    daysBeforeEvent: 7,
    need: "Data analyst for player behaviour",
    task: {
      title: "Find where players quit level 12",
      format: "read",
      proofKind: "writing",
      minutes: 10,
      skills: ["data-visualisation", "metrics-definition", "experiment-design", "stakeholder-communication"],
      brief:
        "In our newest puzzle game, many players stop at level 12. The design team wants to make the level easier. Read the numbers and tell the team what you see, and the test you would run before changing the level for everyone. This is a synthetic example.",
      material: {
        kind: "text",
        title: "Level 12, last 14 days (synthetic)",
        body: [
          "Players who start level 12: 84 000.",
          "Players who finish it: 51 000 (61%). Levels 10 and 11: 88% and 85%.",
          "Average tries before a win: 4.2 (level 11: 1.6).",
          "Level 12 is the first level with a timer.",
          "Players who quit after a loss see an ad 70% of the time.",
        ].join("\n"),
      },
      deliverable: "Write what you see in up to five sentences, and the test you would run.",
    },
  },
  {
    key: "tuulos-stop",
    companyIds: ["co-tuulos"],
    daysBeforeEvent: 6,
    need: "Embedded robotics engineer for safe stops",
    task: {
      title: "Make a pick robot stop safely",
      format: "fix",
      proofKind: "writing",
      minutes: 12,
      skills: ["embedded-constraints", "safety-thinking", "test-strategy", "technical-explanation"],
      brief:
        "Our pick robot arm must stop when a person walks into its zone. A teammate wrote the stop logic below and it passed the test at the office. Warehouses are cold, light curtains get frost, and the arm can carry 20 kg boxes. Tell us what you would change before the next customer test. This is a synthetic example.",
      material: {
        kind: "text",
        title: "Stop logic, plain words (synthetic)",
        body: [
          "Every 100 ms, read the light curtain.",
          "If blocked: finish the current move, then stop.",
          "If the curtain does not answer: keep going, it may be frost.",
          "After a stop: start again by itself after 3 seconds clear.",
          "Tested: 20 stops at the office at 21 °C, empty gripper.",
        ].join("\n"),
      },
      deliverable: "List the changes you would make, most important first, and the test you would add for each.",
    },
  },
  {
    key: "kivira-checkout",
    companyIds: ["co-kivira"],
    daysBeforeEvent: 6,
    need: "Frontend developer for payment forms",
    task: {
      title: "Make a payment form work for everyone",
      format: "fix",
      proofKind: "writing",
      minutes: 10,
      skills: ["accessibility", "ui-state", "error-handling", "writing-clarity"],
      brief:
        "Logistics companies pay their invoices through our payment form. Support gets calls from people who cannot finish a payment. The form is described below. Tell us what you would change first, and why. This is a synthetic example.",
      material: {
        kind: "text",
        title: "The payment form (synthetic)",
        body: [
          "Fields have grey placeholder text but no labels.",
          "Errors appear only as a red border, after pressing Pay.",
          "The Pay button can be pressed twice while the payment runs.",
          "On a timeout the form clears all fields.",
          "The IBAN field accepts only capital letters without spaces.",
        ].join("\n"),
      },
      deliverable: "List the changes, most important first, with one line on why for each.",
    },
  },
  {
    key: "polarbyte-orders",
    companyIds: ["co-polarbyte"],
    daysBeforeEvent: 2,
    need: "Backend developer for our order API",
    task: {
      title: "Find why some web shop orders arrive twice",
      format: "fix",
      proofKind: "writing",
      minutes: 20,
      skills: ["api-design", "error-handling", "data-modelling", "observability"],
      brief:
        "Our order API takes orders from about 300 web shops. Since Monday, a few shops see the same order twice in their warehouse list, and two customers were charged twice. The log and the handler are below. Tell us what goes wrong and how you would fix it so it cannot happen again. This is a synthetic example.",
      material: {
        kind: "text",
        title: "Order log and handler, shop 118 (synthetic)",
        body: [
          "09:14:02.110 POST /orders cart=7731 from shop 118",
          "09:14:02.940 payment ok, charge ch_51 for 84.90 EUR",
          "09:14:05.001 shop 118 client timeout after 3 s, retrying",
          "09:14:05.020 POST /orders cart=7731 from shop 118",
          "09:14:05.300 order 50211 saved, warehouse notified",
          "09:14:05.880 payment ok, charge ch_52 for 84.90 EUR",
          "09:14:06.140 order 50212 saved, warehouse notified",
          "",
          "Handler, in order:",
          "1. Charge the card.",
          "2. Save a new order row with a new id.",
          "3. Tell the warehouse.",
          "4. Return 201 with the order id.",
          "Orders table: id, shop_id, cart_id, total, created_at. No unique keys except id.",
        ].join("\n"),
      },
      deliverable: "Explain the cause in two lines, then list your fix in up to five steps.",
    },
  },
  {
    key: "tahka-pipeline",
    companyIds: ["co-tahka"],
    daysBeforeEvent: 6,
    need: "Data engineer for nightly data loads",
    task: {
      title: "Explain the jump in last night's harvest numbers",
      format: "read",
      proofKind: "writing",
      minutes: 15,
      skills: ["pipeline-reliability", "data-quality", "sql", "technical-explanation"],
      brief:
        "Every night we load harvest weighings from about 400 farms. This morning the dashboard showed twice the usual grain for Tuesday, and a co-op manager already called. The load notes are below. Tell us what most likely happened and what you would change in the load. This is a synthetic example.",
      material: {
        kind: "text",
        title: "Load notes, Tuesday night (synthetic)",
        body: [
          "02:00 load started, reads files from the farm upload folder.",
          "02:41 load failed: connection lost to the database after 61% of rows.",
          "02:45 automatic retry started from the first file.",
          "03:30 load finished, 1.61 times the usual row count.",
          "The load inserts rows; it never updates or deletes.",
          "Each weighing has farm_id, scale_id, weighed_at and kg.",
          "Dashboard: SUM(kg) per day, no filters.",
        ].join("\n"),
      },
      deliverable: "Name the cause, the fix for today's numbers, and the change that stops it next time.",
    },
  },
  {
    key: "kaarna-eval",
    companyIds: ["co-kaarna"],
    daysBeforeEvent: 8,
    need: "AI engineer for a Finnish support assistant",
    // The event's big open task: the company reads many answers and shortlists from them.
    places: 30,
    task: {
      title: "Write the test set for a city assistant",
      format: "make",
      proofKind: "writing",
      minutes: 30,
      skills: ["llm-evaluation", "test-strategy", "risk-sense", "prompt-design", "writing-clarity"],
      brief:
        "A city wants our AI assistant to answer residents about waste collection, parking permits and school places. It must answer in Finnish, Swedish and English, and pass hard cases to a person. Before the pilot, we need a first test set. Write the questions you would test with, what the assistant should do for each, and which answers must never reach a resident. This is a synthetic example.",
      material: {
        kind: "text",
        title: "Pilot facts (synthetic)",
        body: [
          "Topics: waste collection, parking permits, school places.",
          "Languages: Finnish, Swedish, English.",
          "The assistant can read the city's public web pages only.",
          "It cannot see a resident's own case or payments.",
          "Hard cases go to the service desk, open 8 to 16 on weekdays.",
          "Pilot: 6 weeks, about 2 000 questions a week expected.",
        ].join("\n"),
      },
      deliverable: "Write ten to fifteen test questions, each with what the assistant should do, and mark the ones that must go to a person.",
    },
  },
  {
    key: "lieko-alert",
    companyIds: ["co-lieko"],
    daysBeforeEvent: 5,
    need: "Security engineer for login alerts",
    task: {
      title: "Decide what to do with a strange login",
      format: "read",
      proofKind: "writing",
      minutes: 15,
      skills: ["incident-response", "security-thinking", "risk-management", "writing-clarity"],
      brief:
        "It is 22:40 on a Friday. An alert came in for a customer, a 120-person accounting firm. The details are below. Decide what you do in the next 30 minutes, and write the short message you would send to the firm's IT contact. This is a synthetic example.",
      material: {
        kind: "text",
        title: "Alert details (synthetic)",
        body: [
          "21:58 login to finance mailbox from Espoo, usual laptop.",
          "22:31 login to the same mailbox from a new country, new browser, MFA approved.",
          "22:33 new inbox rule: move mail with 'invoice' to RSS folder.",
          "22:36 14 mails sent to customers with a new bank account number.",
          "The mailbox owner is on holiday until Monday.",
          "Our contract lets us lock accounts after a call to the IT contact.",
        ].join("\n"),
      },
      deliverable: "List your steps for the next 30 minutes, then write the message to the IT contact in up to six lines.",
    },
  },
  {
    key: "utu-sync",
    companyIds: ["co-utu"],
    daysBeforeEvent: 7,
    need: "Mobile developer for an offline field app",
    task: {
      title: "Choose how inspection photos sync offline",
      format: "choose",
      proofKind: "writing",
      minutes: 12,
      skills: ["mobile-constraints", "architecture-tradeoffs", "error-handling", "ui-state"],
      brief:
        "Power line inspectors use our app in forests with no signal for hours. Each inspection has notes and 5 to 20 photos. Today photos upload only at the end of the day, and inspectors lose work when the phone dies. Pick one of the two plans, say why, and say what the inspector sees on screen while it works. This is a synthetic example.",
      material: {
        kind: "text",
        title: "What we know (synthetic)",
        body: [
          "Phones: mid-range Android, 64 GB, often below 20% battery by 15:00.",
          "Photos: about 4 MB each.",
          "Signal: none for 2 to 5 hours, then some 3G near roads.",
          "Last month: 11 inspections lost, all when a phone shut down.",
        ].join("\n"),
      },
      options: [
        {
          id: "a",
          title: "A: Save and queue every photo at once",
          body: "Save each photo to the phone's storage the moment it is taken, and upload from a queue whenever any signal appears.",
        },
        {
          id: "b",
          title: "B: Upload one small bundle at the end",
          body: "Shrink the photos and send one bundle per inspection when the inspector taps Finish and has signal.",
        },
      ],
      deliverable: "Pick A or B, give your reason, and describe what the inspector sees while photos wait.",
    },
  },
  {
    key: "kenno-release",
    companyIds: ["co-kenno"],
    daysBeforeEvent: 4,
    need: "QA automation engineer for release testing",
    task: {
      title: "Pick the tests before Friday's release",
      format: "make",
      proofKind: "plan",
      minutes: 20,
      skills: ["test-strategy", "prioritisation", "risk-sense", "writing-clarity"],
      brief:
        "On Friday we release a new payment step for swimming pool bookings in 40 towns. We have time for about ten manual checks before the release, and our automated tests do not cover payments yet. The change list is below. Write the checks you would do, in order. This is a synthetic example.",
      material: {
        kind: "text",
        title: "What changes on Friday (synthetic)",
        body: [
          "New payment provider for all card payments.",
          "Season tickets can now be paid in three parts.",
          "Refunds for cancelled swims go back to the card, not to a voucher.",
          "The booking screen moved the Pay button to the bottom.",
          "Town discount codes stay as before.",
          "Saturday mornings are the busiest booking time.",
        ].join("\n"),
      },
      deliverable: "List up to ten checks in the order you would run them, with one line on why each one is there.",
    },
  },
  {
    key: "rasti-trail",
    companyIds: ["co-rasti"],
    daysBeforeEvent: 6,
    need: "UX designer for a trail safety app",
    task: {
      title: "Design the warning for a closed trail",
      format: "make",
      proofKind: "design",
      minutes: 20,
      skills: ["interaction-design", "accessibility", "plain-language", "user-research"],
      brief:
        "When a trail is closed for a storm or logging, hikers see a small grey line in the app, and many walk on. Design the warning a hiker sees on the trail, with cold hands and a phone in bright snow. Say how you would test it with five hikers. This is a synthetic example.",
      material: {
        kind: "text",
        title: "What we know (synthetic)",
        body: [
          "Closed trails last winter: 37, most after storms.",
          "Hikers who walked on into a closed part: about 1 in 3.",
          "Many hikers use the app with gloves on.",
          "About a fifth of users read the app in English, not Finnish or Swedish.",
          "The app works offline once the map is saved.",
        ].join("\n"),
      },
      deliverable: "Sketch or describe the warning in up to eight lines, and list what you would ask the five hikers.",
    },
  },
  {
    key: "laituri-picking",
    companyIds: ["co-laituri"],
    daysBeforeEvent: 5,
    need: "Data analyst for warehouse picking",
    task: {
      title: "Explain why picking slowed down in week 44",
      format: "read",
      proofKind: "writing",
      minutes: 15,
      skills: ["data-quality", "data-visualisation", "metrics-definition", "stakeholder-communication"],
      brief:
        "Our warehouse manager says picking got 18% slower in week 44 and wants to hire four more pickers before Christmas. The weekly numbers are below. Read them and write what you would tell the manager before the hiring decision. This is a synthetic example.",
      material: {
        kind: "text",
        title: "Weekly picking numbers (synthetic)",
        body: [
          "Week 42: 24 800 order lines, 61 lines per picker hour, 1.9 lines per order.",
          "Week 43: 25 300 order lines, 60 lines per picker hour, 2.0 lines per order.",
          "Week 44: 26 100 order lines, 50 lines per picker hour, 3.4 lines per order.",
          "Week 44: a new garden shop customer started, bulky items in aisle 30.",
          "Week 44: 6 new pickers started on Monday.",
          "Picker hours come from the clock-in system, lines from the scanners.",
        ].join("\n"),
      },
      deliverable: "Write a note to the manager in up to eight lines, with the one number you would show first.",
    },
  },
  {
    key: "ulappa-congress",
    companyIds: ["co-ulappa"],
    daysBeforeEvent: 7,
    need: "Business analyst for hotel room pricing",
    task: {
      title: "Price the rooms for a congress week",
      format: "choose",
      proofKind: "writing",
      minutes: 15,
      skills: ["budget-analysis", "risk-management", "prioritisation", "stakeholder-communication"],
      brief:
        "A medical congress with 2 400 guests comes to Espoo in March. Its organiser wants 300 of our 380 rooms for four nights at a fixed price. Our sales team likes the deal; our revenue team wants to keep rooms for other guests. Pick one offer, say why, and name the risk you would write into the contract. This is a synthetic example.",
      material: {
        kind: "text",
        title: "March numbers (synthetic)",
        body: [
          "Usual March occupancy: 64%, average price 132 EUR.",
          "Last congress week: 97% full, average price 189 EUR.",
          "The organiser cancels unused rooms up to 30 days before, free.",
          "Last year the same organiser used 81% of the rooms it booked.",
          "Breakfast and meeting rooms add about 40 EUR per room night.",
        ].join("\n"),
      },
      options: [
        {
          id: "a",
          title: "A: 300 rooms at 149 EUR",
          body: "Give the organiser 300 rooms for four nights at 149 EUR, with breakfast and meeting rooms in the deal.",
        },
        {
          id: "b",
          title: "B: 200 rooms at 165 EUR",
          body: "Offer 200 rooms at 165 EUR and keep 180 rooms for other guests at the day's price.",
        },
      ],
      deliverable: "Pick A or B, show the sum behind your choice, and name the contract term you would add.",
    },
  },
  {
    key: "perusta-delay",
    companyIds: ["co-perusta"],
    daysBeforeEvent: 4,
    need: "Technical project manager for a school building site",
    task: {
      title: "Re-plan the week after a late concrete delivery",
      format: "make",
      proofKind: "plan",
      minutes: 20,
      skills: ["planning", "risk-management", "work-safety", "stakeholder-communication"],
      brief:
        "We are building a school in Espoonlahti that must open in August. The concrete for the second floor came two days late, and frost is forecast for Thursday night. The week's plan is below. Re-plan the rest of the week and say who you would tell what. This is a synthetic example.",
      material: {
        kind: "text",
        title: "This week's plan (synthetic)",
        body: [
          "Mon: pour second-floor slab (moved, concrete late).",
          "Tue: electricians start on the first floor.",
          "Wed: crane booked 7 to 15 for roof trusses, cannot be moved this month.",
          "Thu: night frost to -6 C forecast.",
          "Fri: city inspector visits the first floor at 10.",
          "Crew: 14 people, 3 of them new this week.",
        ].join("\n"),
      },
      deliverable: "Write the new plan day by day, then list who you would tell and what, in up to six lines.",
    },
  },
] as const satisfies readonly ExtraSeedChallenge[];
