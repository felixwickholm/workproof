import type { RoleTemplate } from "../role-template";

export const fullStackEngineer: RoleTemplate = {
  id: "full-stack",
  title: "Full-stack engineer",
  level: "degree",
  keywords: [
    "full-stack", "full stack", "fullstack", "software engineer", "software developer",
    "web application", "ohjelmistokehittäjä", "ohjelmistoinsinööri", "sovelluskehittäjä", "koodari", "programmer", "ohjelmoija",
  ],
  skills: ["code-review", "security-thinking", "data-modelling", "api-design", "testing"],
  why: {
    "code-review": "Small teams ship features end to end. Each person reviews code across the whole stack.",
    "security-thinking": "This form writes to the database that holds customer bookings.",
  },
  lookFor: {
    "security-thinking": "Finds where user input reaches the database or the page unchecked and proposes a fix.",
    "data-modelling": "Questions whether the data model can stop two bookings for the same slot.",
  },
  constraints: [
    "two hundred people tried to book in the same minute",
    "the feature had to ship today",
    "the database could not be migrated this week",
    "the booking page was embedded on a partner site",
  ],
  challenge: {
    minutes: 15,
    title: "Review an AI-written booking feature",
    format: "fix",
    proofKind: "code",
    brief:
      "Customers book a time slot to pick up equipment. A teammate wrote the booking handler with an AI assistant. It works when one person books at a time. On launch days, many people try to book the same slots within minutes. Please review it before we release it.",
    material: {
      kind: "code",
      title: "api/bookings.ts",
      body: [
        "export async function POST(req: Request) {",
        "  const { slotId, email, note } = await req.json();",
        "",
        "  const slot = await sql`SELECT * FROM slots WHERE id = ${slotId}`;",
        "  const taken = await sql.unsafe(",
        "    `SELECT count(*) FROM bookings WHERE slot_id = '${slotId}'`",
        "  );",
        "",
        "  if (taken[0].count >= slot[0].capacity) {",
        "    return Response.json({ error: \"Slot is full\" }, { status: 409 });",
        "  }",
        "",
        "  await sql`INSERT INTO bookings (slot_id, email, note)",
        "            VALUES (${slotId}, ${email}, ${note})`;",
        "",
        "  await sendEmail(email, `Booked. Your note: ${note}`, { html: true });",
        "  return Response.json({ ok: true });",
        "}",
      ].join("\n"),
    },
    deliverable:
      "What would you change before this ships, and why? List the changes in order of importance. A few sentences each is enough.",
    flaws: [
      {
        label: "the check-then-insert race that overbooks a slot",
        cues: ["race", "concurren", "transaction", "lock", "overbook", "same time", "constraint", "for update", "atomic"],
      },
      {
        label: "the unsafe query built from user input",
        cues: ["injection", "sql.unsafe", "unsafe", "parameter", "string interpolation", "escape"],
      },
      {
        label: "the note placed unescaped into an HTML email",
        cues: ["html", "escape", "xss", "note", "email", "sanitize", "sanitise", "markup"],
      },
    ],
  },
  taster: {
    title: "Spot the problem in a login check",
    format: "fix",
    proofKind: "code",
    brief: "An AI assistant wrote this check for a staff page.",
    material: {
      kind: "code",
      title: "staff.ts",
      body: [
        "const isStaff = localStorage.getItem(\"role\") === \"staff\";",
        "if (isStaff) {",
        "  showStaffPanel(await fetch(\"/api/all-orders\").then(r => r.json()));",
        "}",
      ].join("\n"),
    },
    deliverable: "What would you change first, and why?",
    flaws: [
      {
        label: "the role check that runs only in the browser",
        cues: ["server", "localstorage", "client side", "client-side", "anyone", "authoriz", "backend", "edit the value"],
      },
    ],
  },
};
