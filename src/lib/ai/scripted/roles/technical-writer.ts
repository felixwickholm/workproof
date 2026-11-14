import type { RoleTemplate } from "../role-template";

export const technicalWriter: RoleTemplate = {
  id: "technical-writer",
  title: "Technical writer",
  keywords: [
    "technical writer", "technical writing", "documentation", "docs", "developer documentation",
    "api documentation", "tekninen kirjoittaja", "teknistä kirjoittamista", "dokumentaatio", "dokumentointi",
  ],
  skills: ["technical-explanation", "writing-clarity", "ai-assisted-work", "user-research"],
  why: {
    "technical-explanation": "Developers decide in the first minute whether our docs can get them running.",
    "writing-clarity": "A setup guide is followed step by step, so one missing step stops the reader.",
  },
  lookFor: {
    "technical-explanation": "Walks through the steps as a new reader would and finds where they would get stuck.",
    "writing-clarity": "Cuts what the reader does not need and puts the steps in the order they are done.",
  },
  constraints: [
    "most readers arrived from a search engine on a phone",
    "the page also had to be translated into Finnish and Swedish",
    "the reader was an operations engineer, not a developer",
    "the page could be at most half as long",
  ],
  challenge: {
    title: "Review an AI-written quickstart page",
    format: "review",
    brief:
      "We are publishing a quickstart for our sensor data API. A teammate asked an AI assistant to write it from the internal wiki. New customers get the link in their welcome email. Please review it as a developer who has never used the API.",
    material: {
      kind: "text",
      title: "Quickstart: read your first sensor values",
      body: [
        "Our API is a powerful, flexible and scalable way to work with sensor data.",
        "It was built by a team with many years of experience in industrial IoT.",
        "",
        "Step 1. Call the readings endpoint:",
        "  curl https://api.example.com/v2/readings?sensor=SENSOR_ID",
        "",
        "Step 2. Create an API key in the dashboard under Settings > Keys.",
        "",
        "Step 3. The response contains a list of readings. Each reading has a",
        "  value and a timestamp. Values are in the sensor's native unit.",
        "",
        "If something goes wrong, check the logs.",
        "",
        "That's it. You are now ready to build on the platform.",
      ].join("\n"),
    },
    deliverable:
      "What would you change before this goes out, and why? List the changes in order of importance.",
    flaws: [
      {
        label: "the API key step that comes after the call that needs it",
        cues: ["order", "step 2", "before step 1", "api key", "auth", "authorization header", "header", "401", "key first"],
      },
      {
        label: "units and timestamp format left unexplained",
        cues: ["unit", "native unit", "timestamp", "time zone", "timezone", "format", "utc", "example response"],
      },
      {
        label: "no guidance on errors",
        cues: ["error", "check the logs", "which logs", "status code", "troubleshoot", "goes wrong"],
      },
    ],
  },
  taster: {
    title: "Spot the problem in an install step",
    format: "review",
    brief: "An AI assistant wrote this install step for a command line tool.",
    material: {
      kind: "text",
      title: "Install",
      body: [
        "Install the tool:",
        "  pip install meterkit",
        "Then simply configure it and you are done.",
      ].join("\n"),
    },
    deliverable: "What would a new user need that this step does not give them?",
    flaws: [
      {
        label: "the configure step with no instructions",
        cues: ["configure", "how to configure", "simply", "config file", "command", "example", "what to set", "missing step"],
      },
    ],
  },
};
