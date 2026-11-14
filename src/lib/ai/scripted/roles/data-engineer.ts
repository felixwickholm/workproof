import type { RoleTemplate } from "../role-template";

export const dataEngineer: RoleTemplate = {
  id: "data-engineer",
  title: "Data engineer",
  keywords: [
    "data engineer", "data engineering", "data pipeline", "etl", "elt", "airflow", "dbt", "spark",
    "kafka", "data platform", "data-insinööri", "datainsinööri", "tietovarasto",
  ],
  skills: ["pipeline-reliability", "data-quality", "sql", "data-modelling", "observability"],
  why: {
    "pipeline-reliability": "Billing and forecasts read this table every hour. A rerun that doubles rows doubles invoices.",
    "data-quality": "Meters report late and twice. The pipeline decides whether those rows count.",
  },
  lookFor: {
    "pipeline-reliability": "Asks what happens when the job runs twice, fails halfway or gets data hours late.",
    sql: "Reads the query for filters and time handling that silently drop or repeat rows.",
  },
  constraints: [
    "the job had to backfill two years of data in one night",
    "the meters sent data up to three days late",
    "the warehouse charged per row scanned",
    "you could not change the source system",
  ],
  challenge: {
    title: "Review an AI-written incremental load",
    format: "review",
    proofKind: "code",
    brief:
      "Our hourly job copies new meter readings into the reporting table that billing uses. A teammate asked an AI assistant to rewrite it so it only loads new rows. It passed a test run yesterday. Some meters send readings hours late, and the scheduler retries failed runs automatically. Please review it before it replaces the old job.",
    material: {
      kind: "code",
      title: "load_readings.py",
      body: [
        "from datetime import datetime",
        "",
        "def run(conn):",
        "    last = conn.scalar(\"SELECT max(read_at) FROM reporting.readings\")",
        "    now = datetime.now()  # server runs in Europe/Helsinki",
        "",
        "    rows = conn.execute(\"\"\"",
        "        SELECT meter_id, read_at, kwh",
        "        FROM raw.meter_readings",
        "        WHERE read_at > %(last)s AND read_at <= %(now)s",
        "    \"\"\", {\"last\": last, \"now\": now}).fetchall()",
        "",
        "    conn.execute(\"\"\"",
        "        INSERT INTO reporting.readings (meter_id, read_at, kwh)",
        "        VALUES (%(meter_id)s, %(read_at)s, %(kwh)s)",
        "    \"\"\", rows)",
        "    conn.commit()",
        "    log.info(f\"loaded {len(rows)} rows\")",
      ].join("\n"),
    },
    deliverable:
      "What would you change before this ships, and why? List the changes in order of importance. A few sentences each is enough.",
    flaws: [
      {
        label: "the watermark on reading time that drops late readings",
        cues: ["late", "watermark", "max(read_at)", "ingested", "arrival", "loaded_at", "lookback", "dropped"],
      },
      {
        label: "the plain insert that duplicates rows on a retry",
        cues: ["duplicate", "idempot", "rerun", "retry", "upsert", "merge", "on conflict", "unique key", "twice"],
      },
      {
        label: "the local server time compared with stored timestamps",
        cues: ["timezone", "time zone", "utc", "datetime.now", "local time", "daylight", "dst", "helsinki"],
      },
    ],
  },
  taster: {
    title: "Spot the problem in a daily count",
    format: "review",
    proofKind: "code",
    brief: "An AI assistant wrote this query for a daily report of active meters.",
    material: {
      kind: "code",
      title: "daily_active.sql",
      body: [
        "SELECT date(read_at) AS day,",
        "       count(meter_id) AS active_meters",
        "FROM raw.meter_readings",
        "GROUP BY 1",
        "ORDER BY 1;",
      ].join("\n"),
    },
    deliverable: "What would you change first, and why?",
    flaws: [
      {
        label: "the count of readings instead of distinct meters",
        cues: ["distinct", "count(distinct", "duplicate", "readings not meters", "each reading", "counts rows", "more than once"],
      },
    ],
  },
};
