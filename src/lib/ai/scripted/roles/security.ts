import type { RoleTemplate } from "../role-template";

export const securityEngineer: RoleTemplate = {
  id: "security-engineer",
  title: "Security engineer",
  keywords: [
    "security engineer", "application security", "appsec", "cybersecurity", "cyber security",
    "penetration testing", "pentest", "infosec", "tietoturva", "tietoturva-asiantuntija", "kyberturvallisuus",
  ],
  skills: ["security-thinking", "threat-modelling", "code-review", "ai-assisted-work", "compliance"],
  why: {
    "security-thinking": "A password reset flow is the easiest way into an account if it trusts the wrong input.",
    "threat-modelling": "Fixes work when they start from what an attacker would actually try against this endpoint.",
  },
  lookFor: {
    "security-thinking": "Names the input an attacker controls, what they gain, and a concrete control for each issue.",
    "code-review": "Points to the exact lines and proposes a change small enough to ship this week.",
  },
  constraints: [
    "you could fix only one issue before Monday",
    "the endpoint must keep working for the mobile app already in stores",
    "attackers are already trying reset links in the logs",
    "the team cannot add a new dependency",
  ],
  challenge: {
    title: "Review an AI-written password reset endpoint",
    format: "review",
    brief:
      "We are replacing our password reset flow. A teammate asked an AI assistant for the endpoint below, and it passes the happy-path test. It handles customer accounts, so we want a security review before it goes live next week.",
    material: {
      kind: "code",
      title: "routes/reset.js",
      body: [
        "router.post(\"/reset/request\", async (req, res) => {",
        "  const user = await db.users.findOne({ email: req.body.email });",
        "  if (!user) return res.status(404).json({ error: \"No account with that email\" });",
        "",
        "  const token = Math.random().toString(36).slice(2, 10);",
        "  await db.resetTokens.insert({ userId: user.id, token, createdAt: Date.now() });",
        "",
        "  const link = `https://${req.headers.host}/reset?token=${token}`;",
        "  await mailer.send(user.email, \"Reset your password\", link);",
        "  res.json({ ok: true });",
        "});",
        "",
        "router.post(\"/reset/confirm\", async (req, res) => {",
        "  const entry = await db.resetTokens.findOne({ token: req.body.token });",
        "  if (!entry) return res.status(400).json({ error: \"Invalid token\" });",
        "",
        "  await db.users.update(entry.userId, { password: hash(req.body.password) });",
        "  res.json({ ok: true });",
        "});",
      ].join("\n"),
    },
    deliverable:
      "What would you change before this ships, and why? List the changes in order of importance. A few sentences each is enough.",
    flaws: [
      {
        label: "the guessable reset token from Math.random",
        topic: "how the token is made",
        cues: ["math.random", "random", "guess", "predictable", "entropy", "crypto", "randombytes", "token length"],
      },
      {
        label: "the token that never expires and can be reused",
        topic: "token expiry and reuse",
        cues: ["expire", "expiry", "expiration", "reuse", "reused", "single use", "one-time", "delete the token", "createdat"],
      },
      {
        label: "the reset link built from the Host header",
        topic: "how the reset link is built",
        cues: ["host header", "req.headers.host", "host", "poison", "attacker domain", "configured domain"],
      },
    ],
  },
  taster: {
    title: "Spot the problem in a login check",
    format: "review",
    brief: "An AI assistant wrote this login query. It works in the demo.",
    material: {
      kind: "code",
      title: "login.js",
      body: [
        "const sql = \"SELECT * FROM users WHERE email = '\"",
        "  + req.body.email + \"' AND password = '\"",
        "  + hash(req.body.password) + \"'\";",
        "const user = await db.query(sql);",
        "if (user.length) startSession(user[0]);",
      ].join("\n"),
    },
    deliverable: "What is the one thing you would change first, and why?",
    flaws: [
      {
        label: "the SQL query built by string concatenation",
        topic: "how the query is built",
        cues: ["injection", "sql injection", "concatenat", "parameter", "prepared statement", "placeholder", "escape"],
      },
    ],
  },
};
