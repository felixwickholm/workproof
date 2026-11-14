import type { RoleTemplate } from "../role-template";

export const dataAnalyst: RoleTemplate = {
  id: "data-analyst",
  title: "Data analyst",
  keywords: [
    "data analyst", "business analyst", "bi analyst", "analyst", "analytics", "power bi", "tableau", "looker",
    "dashboard", "data-analyytikko", "data analyytikko", "analyytikko", "raportointi", "tietoanalyytikko",
  ],
  skills: ["sql", "metrics-definition", "data-visualisation", "data-quality", "stakeholder-communication"],
  why: {
    sql: "The weekly churn number starts from this query, and a wrong join gives a confident wrong number.",
    "metrics-definition": "Leadership compares this number week to week, so it has to mean one thing.",
  },
  lookFor: {
    sql: "Reads the joins, filters and grouping and explains how each one changes the number.",
    "metrics-definition": "Asks what counts as a churned customer and what the number leaves out.",
  },
  constraints: [
    "the number had to be ready for the board meeting in two hours",
    "the billing table was updated only once a day",
    "the sales team would use the number in their bonus plan",
    "half of the customers paid yearly instead of monthly",
  ],
  challenge: {
    title: "Review an AI-written churn query",
    format: "review",
    proofKind: "code",
    brief:
      "Leadership wants a monthly churn rate on the company dashboard. A teammate asked an AI assistant for the query below, and it returns a number that looks reasonable. It goes on the dashboard on Monday. Please review it before then.",
    material: {
      kind: "code",
      title: "monthly_churn.sql",
      body: [
        "-- churn rate = customers who cancelled this month / customers this month",
        "SELECT",
        "  date_trunc('month', s.cancelled_at) AS month,",
        "  COUNT(s.customer_id) AS churned,",
        "  COUNT(c.id) AS customers,",
        "  COUNT(s.customer_id)::float / COUNT(c.id) AS churn_rate",
        "FROM customers c",
        "JOIN subscriptions s ON s.customer_id = c.id",
        "WHERE s.cancelled_at IS NOT NULL",
        "  AND c.is_test = false",
        "GROUP BY 1",
        "ORDER BY 1;",
      ].join("\n"),
    },
    deliverable:
      "What would you change before this ships, and why? List the changes in order of importance. A few sentences each is enough.",
    flaws: [
      {
        label: "the denominator that counts only cancelled customers",
        cues: ["denominator", "where s.cancelled_at", "only cancelled", "always 1", "100%", "active customers", "customers at the start", "divide"],
      },
      {
        label: "customers with several subscriptions counted more than once",
        cues: ["several subscriptions", "multiple subscriptions", "duplicate", "distinct", "count(distinct", "join multiplies", "more than once", "fan out"],
      },
      {
        label: "no clear definition of who counts as churned",
        cues: ["definition", "define churn", "downgrade", "pause", "reactivat", "came back", "what counts", "yearly"],
      },
    ],
  },
  taster: {
    title: "Spot the problem in a chart",
    format: "review",
    proofKind: "writing",
    brief: "An AI assistant drafted this dashboard spec for the sales team.",
    material: {
      kind: "text",
      title: "Chart spec",
      body: [
        "Chart: monthly revenue, bar chart.",
        "Y axis starts at 950,000 euros so the changes are easy to see.",
        "Title: Revenue is growing fast.",
      ].join("\n"),
    },
    deliverable: "What would you change in this chart before the sales team sees it, and why?",
    flaws: [
      {
        label: "the bar chart axis that does not start at zero",
        cues: ["axis", "zero", "baseline", "950", "truncat", "exaggerat", "misleading", "bar chart"],
      },
    ],
  },
};
