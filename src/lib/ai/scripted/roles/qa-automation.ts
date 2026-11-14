import type { RoleTemplate } from "../role-template";

export const qaEngineer: RoleTemplate = {
  id: "qa-engineer",
  title: "QA and test automation engineer",
  level: "degree",
  keywords: [
    "qa", "quality assurance", "test automation", "test engineer", "tester", "playwright", "cypress",
    "selenium", "testaaja", "testausautomaatio", "testausinsinööri", "laadunvarmistus",
  ],
  skills: ["test-strategy", "testing", "code-review", "ai-assisted-work"],
  why: {
    "test-strategy": "Our checkout tests run on every merge, so a test that passes for the wrong reason lets bugs through every day.",
    testing: "A flaky test teaches the team to ignore red builds.",
  },
  lookFor: {
    "test-strategy": "Asks what the test proves about the user's outcome, and names the risky cases it does not cover.",
    testing: "Spots waits and checks that make the test flaky or always green, and proposes a reliable alternative.",
  },
  constraints: [
    "the whole suite had to finish in under 5 minutes",
    "you could add only one more test this sprint",
    "the payment provider sandbox is down twice a week",
    "the checkout page is being redesigned next month",
  ],
  challenge: {
    minutes: 15,
    title: "Review an AI-written checkout test",
    format: "fix",
    proofKind: "code",
    brief:
      "We are adding end-to-end tests for checkout. A teammate asked an AI assistant for the Playwright test below. It is green in CI, but last week a broken discount code still reached customers. Before we rely on this test, we want your review.",
    material: {
      kind: "code",
      title: "checkout.spec.ts",
      body: [
        "import { test, expect } from \"@playwright/test\";",
        "",
        "test(\"customer can check out with a discount\", async ({ page }) => {",
        "  await page.goto(\"/shop\");",
        "  await page.click(\".product-card >> nth=0\");",
        "  await page.click(\"text=Add to cart\");",
        "  await page.goto(\"/checkout\");",
        "",
        "  await page.fill(\"#discount\", \"AUTUMN20\");",
        "  await page.click(\"text=Apply\");",
        "  await page.waitForTimeout(3000);",
        "",
        "  await page.click(\"text=Pay now\");",
        "  await page.waitForTimeout(5000);",
        "",
        "  expect(page.url()).toContain(\"/checkout\");",
        "  await page.screenshot({ path: \"checkout.png\" });",
        "});",
      ].join("\n"),
    },
    deliverable:
      "What would you change before this ships, and why? List the changes in order of importance. A few sentences each is enough.",
    flaws: [
      {
        label: "the assertion that passes even when checkout fails",
        cues: ["assert", "expect", "tocontain", "url", "always pass", "passes anyway", "confirmation", "order number", "does not check"],
      },
      {
        label: "the fixed sleeps that make the test slow and flaky",
        cues: ["waitfortimeout", "sleep", "fixed wait", "flaky", "3000", "5000", "wait for", "auto-wait"],
      },
      {
        label: "no check that the discount changed the total",
        cues: ["discount", "total", "price", "autumn20", "applied", "amount"],
      },
    ],
  },
  taster: {
    title: "Spot the problem in a login test",
    format: "fix",
    proofKind: "code",
    brief: "An AI assistant wrote this test. It has never failed.",
    material: {
      kind: "code",
      title: "login.spec.ts",
      body: [
        "test(\"wrong password shows an error\", async ({ page }) => {",
        "  await page.goto(\"/login\");",
        "  await page.fill(\"#password\", \"wrong\");",
        "  await page.click(\"text=Sign in\");",
        "  expect(page.locator(\".error\")).toBeTruthy();",
        "});",
      ].join("\n"),
    },
    deliverable: "Why does this test never fail, and how would you fix it?",
    flaws: [
      {
        label: "the check on a locator object that is always truthy",
        cues: ["locator", "truthy", "tobetruthy", "always true", "tobevisible", "await expect", "object", "never fails"],
      },
    ],
  },
};
