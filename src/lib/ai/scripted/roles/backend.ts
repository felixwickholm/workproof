import type { RoleTemplate } from "../role-template";

export const backendEngineer: RoleTemplate = {
  id: "backend",
  title: "Backend engineer",
  keywords: [
    "backend", "back-end", "back end", "api developer", "server-side", "node.js", "java", "golang",
    "django", "spring", "microservices", "backend-kehittäjä", "taustajärjestelmä",
  ],
  skills: ["error-handling", "api-design", "code-review", "security-thinking", "testing"],
  why: {
    "error-handling": "This service sits between our app and a payment provider. When the provider is slow, our users wait or pay twice.",
    "api-design": "The mobile app and two partner systems call this endpoint, so its behaviour is a promise.",
  },
  lookFor: {
    "error-handling": "Says what happens when the provider is slow, down or returns an error, and how retries are bounded.",
    "security-thinking": "Notices input that reaches the provider unchecked and proposes validation.",
  },
  constraints: [
    "the payment provider allowed only 10 requests per second",
    "the change had to ship in one hour",
    "the mobile app could not be updated for a month",
    "the provider did not support idempotency keys",
  ],
  challenge: {
    title: "Review an AI-written payment endpoint",
    format: "review",
    brief:
      "We added an endpoint that charges a customer for a parcel delivery. A teammate wrote it with an AI assistant and the happy path works in staging. The payment provider has slow periods a few times a week, and the mobile app retries when a request takes long. Please review the change before we merge it.",
    material: {
      kind: "code",
      title: "routes/charge.ts",
      body: [
        "app.post(\"/charges\", async (req, res) => {",
        "  const { orderId, amountCents, currency } = req.body;",
        "",
        "  let attempt = 0;",
        "  while (true) {",
        "    try {",
        "      const charge = await fetch(`${PAY_URL}/v1/charges`, {",
        "        method: \"POST\",",
        "        headers: { Authorization: `Bearer ${PAY_KEY}` },",
        "        body: JSON.stringify({ orderId, amountCents, currency }),",
        "      }).then((r) => r.json());",
        "",
        "      await db.orders.update(orderId, { status: \"paid\", chargeId: charge.id });",
        "      return res.json({ ok: true, chargeId: charge.id });",
        "    } catch (err) {",
        "      attempt++;",
        "      log.warn(`charge failed, retrying (attempt ${attempt})`);",
        "    }",
        "  }",
        "});",
      ].join("\n"),
    },
    deliverable:
      "What would you change before this ships, and why? List the changes in order of importance. A few sentences each is enough.",
    flaws: [
      {
        label: "the outbound call without a timeout",
        topic: "timeouts",
        cues: ["timeout", "time out", "abortcontroller", "abort", "hang", "slow provider", "waits forever"],
      },
      {
        label: "the retry loop without a limit or backoff",
        topic: "the retry loop",
        cues: ["while (true)", "infinite", "unbounded", "backoff", "retry limit", "max attempts", "loop forever", "retries"],
      },
      {
        label: "the missing idempotency key and input checks that allow double or invalid charges",
        topic: "duplicate and invalid charges",
        cues: ["idempot", "double charge", "charged twice", "duplicate", "validate", "validation", "negative", "amountcents", "zod", "schema"],
      },
    ],
  },
  taster: {
    title: "Spot the problem in a delete endpoint",
    format: "review",
    brief: "An AI assistant wrote this endpoint so users can delete a saved address.",
    material: {
      kind: "code",
      title: "routes/addresses.ts",
      body: [
        "app.delete(\"/addresses/:id\", requireLogin, async (req, res) => {",
        "  await db.addresses.delete(req.params.id);",
        "  res.status(204).end();",
        "});",
      ].join("\n"),
    },
    deliverable: "What would you change first, and why?",
    flaws: [
      {
        label: "the missing check that the address belongs to the logged-in user",
        topic: "who may change the address",
        cues: ["owner", "belongs", "user id", "userid", "authoriz", "other user", "anyone", "idor", "access control"],
      },
    ],
  },
};
