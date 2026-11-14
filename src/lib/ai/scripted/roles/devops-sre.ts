import type { RoleTemplate } from "../role-template";

export const devopsEngineer: RoleTemplate = {
  id: "devops-sre",
  title: "DevOps and site reliability engineer",
  level: "degree",
  keywords: [
    "devops", "sre", "site reliability", "platform engineer", "kubernetes", "k8s", "terraform",
    "ci/cd", "infrastructure engineer", "ylläpito", "ylläpitäjä", "palvelinylläpito", "infra",
  ],
  skills: ["infrastructure-as-code", "observability", "incident-response", "security-thinking", "cloud-architecture"],
  why: {
    "infrastructure-as-code": "One change to this file reaches every service in production.",
    observability: "The on-call person sleeps through alerts that fire too often.",
  },
  lookFor: {
    "infrastructure-as-code": "Reads the change for blast radius and unsafe defaults, and proposes a safer rollout.",
    "incident-response": "Says how the team would notice a bad rollout and how to roll it back.",
  },
  constraints: [
    "the cluster ran at 90% memory already",
    "you could not have any downtime during the day",
    "the on-call team was one person",
    "the cloud budget could not grow this quarter",
  ],
  challenge: {
    title: "Review an AI-written deployment change",
    format: "review",
    proofKind: "code",
    brief:
      "We are moving the order service to a new Kubernetes setup. A teammate wrote the manifest with an AI assistant and it starts fine in staging. The service handles about 40 requests per second at peak and talks to a managed Postgres. Please review it before we apply it to production.",
    material: {
      kind: "code",
      title: "order-service.yaml",
      body: [
        "apiVersion: apps/v1",
        "kind: Deployment",
        "metadata:",
        "  name: order-service",
        "spec:",
        "  replicas: 1",
        "  template:",
        "    spec:",
        "      containers:",
        "        - name: app",
        "          image: registry.internal/order-service:latest",
        "          env:",
        "            - name: DATABASE_URL",
        "              value: postgres://orders:S3cret-2026@db.internal:5432/orders",
        "          ports:",
        "            - containerPort: 8080",
        "          # no readiness or liveness probe yet",
      ].join("\n"),
    },
    deliverable:
      "What would you change before this ships, and why? List the changes in order of importance. A few sentences each is enough.",
    flaws: [
      {
        label: "the database password in plain text in the manifest",
        cues: ["secret", "password", "plain text", "plaintext", "credential", "vault", "secretkeyref"],
      },
      {
        label: "the single replica with no probes, so a restart or bad pod drops traffic",
        cues: ["replica", "readiness", "liveness", "probe", "single", "downtime", "health check", "rolling"],
      },
      {
        label: "the latest image tag that makes deploys unrepeatable",
        cues: ["latest", "tag", "pin", "digest", "version", "rollback", "reproducib"],
      },
    ],
  },
  taster: {
    title: "Spot the problem in an alert",
    format: "review",
    proofKind: "code",
    brief: "An AI assistant wrote this alert for the checkout service.",
    material: {
      kind: "code",
      title: "alerts.yaml",
      body: [
        "- alert: CheckoutErrors",
        "  expr: http_errors_total{service=\"checkout\"} > 0",
        "  for: 0m",
        "  labels: { severity: page }",
      ].join("\n"),
    },
    deliverable: "What would you change first, and why?",
    flaws: [
      {
        label: "the alert on a total counter that pages for any single error",
        cues: ["rate", "counter", "total", "any error", "noise", "noisy", "threshold", "ratio", "for: 0m", "page"],
      },
    ],
  },
};
