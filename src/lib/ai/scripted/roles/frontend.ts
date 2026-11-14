import type { RoleTemplate } from "../role-template";

export const frontendEngineer: RoleTemplate = {
  id: "frontend",
  title: "Frontend engineer",
  level: "degree",
  keywords: [
    "frontend", "front-end", "front end", "react", "vue", "angular", "web developer", "ui engineer",
    "frontend-kehittäjä", "käyttöliittymäkehittäjä", "game developer", "game programmer", "pelinkehittäjä",
  ],
  skills: ["ui-state", "accessibility", "code-review", "performance", "testing"],
  why: {
    "ui-state": "Our search box is used hundreds of times a day. Stale results show the wrong parcel.",
    accessibility: "Warehouse staff use this screen with keyboards and screen zoom.",
  },
  lookFor: {
    "ui-state": "Traces what the user sees while typing fast, while loading and after an error.",
    accessibility: "Checks that the input has a label and that results can be reached with a keyboard.",
  },
  constraints: [
    "the search API took two seconds to answer",
    "half of the users were on old tablets",
    "you could not add a new dependency",
    "the screen had to work offline for short periods",
  ],
  challenge: {
    title: "Review an AI-written search component",
    format: "review",
    proofKind: "code",
    brief:
      "Our staff search for parcels by tracking code. A teammate used an AI assistant to write a new search component. It looks right in a quick demo. Users type fast, the API is sometimes slow, and some staff use only a keyboard. Please review it before it ships.",
    material: {
      kind: "code",
      title: "ParcelSearch.tsx",
      body: [
        "export function ParcelSearch() {",
        "  const [query, setQuery] = useState(\"\");",
        "  const [results, setResults] = useState<Parcel[]>([]);",
        "",
        "  useEffect(() => {",
        "    fetch(`/api/parcels?q=${query}`)",
        "      .then((r) => r.json())",
        "      .then((data) => setResults(data));",
        "  }, [query]);",
        "",
        "  return (",
        "    <div>",
        "      <input placeholder=\"Tracking code\" value={query}",
        "        onChange={(e) => setQuery(e.target.value)} />",
        "      {results.map((p) => (",
        "        <div onClick={() => openParcel(p.id)}>{p.code}</div>",
        "      ))}",
        "    </div>",
        "  );",
        "}",
      ].join("\n"),
    },
    deliverable:
      "What would you change before this ships, and why? List the changes in order of importance. A few sentences each is enough.",
    flaws: [
      {
        label: "the race where an older response overwrites newer results",
        cues: ["race", "out of order", "stale", "abort", "cancel", "older request", "cleanup", "debounce"],
      },
      {
        label: "the clickable divs and placeholder-only label that block keyboard and screen reader users",
        cues: ["keyboard", "button", "label", "aria", "screen reader", "focus", "accessib", "placeholder", "div"],
      },
      {
        label: "the missing loading, empty and error states",
        cues: ["loading", "error", "empty", "catch", "no results", "spinner", "failed"],
      },
    ],
  },
  taster: {
    title: "Spot the problem in a counter",
    format: "review",
    proofKind: "code",
    brief: "An AI assistant wrote this button to add items to a cart.",
    material: {
      kind: "code",
      title: "AddButton.tsx",
      body: [
        "const [count, setCount] = useState(0);",
        "function addThree() {",
        "  setCount(count + 1);",
        "  setCount(count + 1);",
        "  setCount(count + 1);",
        "}",
      ].join("\n"),
    },
    deliverable: "What does this do when clicked, and what would you change?",
    flaws: [
      {
        label: "the stale state value that adds one instead of three",
        cues: ["stale", "functional update", "prev", "c => c + 1", "only one", "adds 1", "batch", "closure"],
      },
    ],
  },
};
