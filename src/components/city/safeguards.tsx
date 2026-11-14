import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "../ui/card";

const LINES = [
  "People score the work. The AI never does.",
  "Names stay hidden until the person says yes.",
  "A written reason comes with every score.",
  "Every action is in the log.",
];

/** How people are kept safe: four short lines and the way to the log. */
export function Safeguards() {
  return (
    <Card tour="city-safeguards">
      <h2 className="text-section text-label">How people are kept safe</h2>
      <ul className="mt-3 grid grid-cols-1 gap-x-8 gap-y-2 min-[700px]:grid-cols-2">
        {LINES.map((line) => (
          <li key={line} className="text-body text-label">
            {line}
          </li>
        ))}
      </ul>
      <Link
        href="/city/log"
        className="press text-subhead mt-4 -ml-1 inline-flex h-11 items-center gap-1 px-1 font-medium text-label hover:text-label-2"
      >
        Open the log
        <ChevronRight aria-hidden className="size-4" strokeWidth={1.75} />
      </Link>
    </Card>
  );
}
