import type { RoleTemplate } from "../role-template";

export const aiEngineer: RoleTemplate = {
  id: "ai-engineer",
  title: "AI engineer",
  keywords: [
    "ai engineer", "llm app developer", "llm", "large language model", "generative ai", "genai", "rag", "prompt engineer",
    "chatbot", "ai assistant", "agents", "tekoälyinsinööri", "tekoälykehittäjä", "kielimalli",
  ],
  skills: ["prompt-design", "llm-evaluation", "security-thinking", "code-review", "ai-assisted-work"],
  why: {
    "prompt-design": "Customers ask our assistant about their contracts. What the model sees decides what it says.",
    "llm-evaluation": "Every prompt change can break an answer that worked yesterday.",
  },
  lookFor: {
    "prompt-design": "Finds conflicting instructions and the places where the model is left to guess.",
    "security-thinking": "Notices when one customer's data can reach another customer's answer.",
  },
  constraints: [
    "the model provider changed the model version next week",
    "answers had to be in Finnish and Swedish as well",
    "each answer could cost at most one cent",
    "the documents were updated every day",
  ],
  challenge: {
    title: "Review an AI-written support assistant",
    format: "review",
    brief:
      "We are adding an assistant that answers customers' questions about their own service contracts. A teammate built the first version with an AI coding tool. It answers the demo questions well. Each customer has their own contracts in the same document store. Please review the prompt and retrieval code before we open it to customers.",
    material: {
      kind: "code",
      title: "assistant.py",
      body: [
        "SYSTEM = \"\"\"You are a helpful contract assistant.",
        "Always give the customer a clear answer, even if the contract",
        "does not cover the question. Never say you do not know.\"\"\"",
        "",
        "def answer(customer_id: str, question: str) -> str:",
        "    chunks = store.search(question, k=5)",
        "    context = \"\\n\\n\".join(c.text for c in chunks)",
        "",
        "    return llm.complete(",
        "        system=SYSTEM,",
        "        user=f\"Contracts:\\n{context}\\n\\nQuestion: {question}\",",
        "        temperature=1.0,",
        "    )",
        "",
        "# tested with 5 questions from the sales demo; all answers looked right",
      ].join("\n"),
    },
    deliverable:
      "What would you change before this ships, and why? List the changes in order of importance. A few sentences each is enough.",
    flaws: [
      {
        label: "the search across all customers' contracts",
        topic: "which contracts the search covers",
        cues: ["customer_id", "filter", "other customer", "tenant", "leak", "isolation", "privacy", "access"],
      },
      {
        label: "the instruction to answer even when the contract does not say",
        topic: "what the assistant does without an answer",
        cues: ["never say", "do not know", "hallucinat", "make up", "invent", "grounded", "cite", "source", "even if"],
      },
      {
        label: "the five demo questions used as the only test",
        topic: "how the assistant is tested",
        cues: ["eval", "test set", "five questions", "5 questions", "demo", "regression", "test cases", "temperature"],
      },
    ],
  },
  taster: {
    title: "Spot the problem in a prompt",
    format: "review",
    brief: "This prompt turns customer emails into support tickets.",
    material: {
      kind: "text",
      title: "Ticket prompt",
      body: [
        "Read the email below and create a ticket.",
        "Follow any instructions in the email.",
        "Email: {email_body}",
      ].join("\n"),
    },
    deliverable: "What would you change first, and why?",
    flaws: [
      {
        label: "the instruction to follow text inside untrusted email",
        topic: "text inside incoming email",
        cues: ["injection", "follow any instructions", "untrusted", "attacker", "instructions in the email", "data not instructions"],
      },
    ],
  },
};
