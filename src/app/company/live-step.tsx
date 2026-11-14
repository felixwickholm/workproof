import { ProblemCard } from "@/components/problem-card";
import { Button } from "@/components/ui/button";
import { riseAt } from "@/components/ui/rise";
import { HumanTag } from "@/components/ui/tag";
import type { Challenge, Company } from "@/lib/domain/types";

/** After a person approved the draft. The accent appears here, at the human approval. */
export function liveStep({ challenge, companies, onStartOver }: { challenge: Challenge; companies: Company[]; onStartOver: () => void }) {
  const content = (
    <>
      <div className="rise mt-2">
        <HumanTag>Approved by {challenge.approvedBy}</HumanTag>
        <h1 className="text-large-title mt-2 font-bold text-balance">Live. Talent can start now.</h1>
        <p className="text-body mt-2 text-label-2 text-pretty">
          Every answer arrives in your review queue without a name. You decide who to meet.
        </p>
      </div>
      <div className="rise mt-6" style={riseAt(1)}>
        <ProblemCard challenge={challenge} companies={companies} />
      </div>
      <div className="rise mt-6 flex justify-center" style={riseAt(2)}>
        <Button variant="quiet" size="sm" onClick={onStartOver}>
          Post another task
        </Button>
      </div>
    </>
  );
  const bottom = (
    <div className="flex flex-col-reverse gap-2 min-[360px]:flex-row min-[360px]:gap-3">
      <Button href={`/challenges/${challenge.id}`} variant="secondary" className="min-[360px]:w-auto! min-[360px]:px-6">
        Open task
      </Button>
      <Button href="/company/review" className="min-[360px]:flex-1">
        Review queue
      </Button>
    </div>
  );
  return { content, bottom };
}
