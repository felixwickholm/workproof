import { EyeOff } from "lucide-react";
import { TaskCard } from "@/components/proof";
import { Button } from "@/components/ui/button";
import { riseAt } from "@/components/ui/rise";
import { HumanTag } from "@/components/ui/tag";
import type { Challenge, Company } from "@/lib/domain/types";

/** Step 3, after a named person approved the draft: the task as talent sees it, and where the answers will land. */
export function LiveStep({ challenge, companies, onStartOver }: { challenge: Challenge; companies: Company[]; onStartOver: () => void }) {
  return (
    <>
      <div className="rise">
        <HumanTag>Approved by {challenge.approvedBy}</HumanTag>
      </div>
      <div className="rise mt-5" style={riseAt(1)}>
        <p className="text-footnote mb-2 font-medium text-label-2">As talent sees it</p>
        <TaskCard challenge={challenge} companies={companies} href={`/challenges/${encodeURIComponent(challenge.id)}`} />
        <p className="text-footnote mt-3 flex items-center gap-2 text-label-2">
          <EyeOff aria-hidden className="size-4 shrink-0" strokeWidth={1.7} />
          Talent never sees your own sentence.
        </p>
      </div>
      <div className="rise mt-8 max-[899px]:hidden" style={riseAt(2)}>
        <LiveActions onStartOver={onStartOver} />
      </div>
    </>
  );
}

/** Where to go next: the queue first, home, or another task. */
export function LiveActions({ onStartOver }: { onStartOver: () => void }) {
  return (
    <div className="flex flex-col gap-2 min-[900px]:flex-row min-[900px]:items-center min-[900px]:gap-3">
      <Button href="/company/review" className="h-[52px] min-[900px]:w-auto! min-[900px]:px-8">
        Open the queue
      </Button>
      <Button href="/employer" variant="secondary" className="h-[52px] min-[900px]:w-auto! min-[900px]:px-6">
        Home
      </Button>
      <Button variant="quiet" size="sm" onClick={onStartOver} className="min-[900px]:ml-2">
        Post another task
      </Button>
    </div>
  );
}
