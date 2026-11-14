import { challengeHref } from "@/components/company/format";
import { TaskCard } from "@/components/proof";
import { Button } from "@/components/ui/button";
import { riseAt } from "@/components/ui/rise";
import type { Challenge, Company } from "@/lib/domain/types";

/** Step 3, after a named person approved the draft: the challenge as people see it, and where to go next. */
export function LiveStep({ challenge, companies, onStartOver }: { challenge: Challenge; companies: Company[]; onStartOver: () => void }) {
  return (
    <>
      <p className="rise text-body text-pretty text-label-2">
        Approved by {challenge.approvedBy}. People can start now. Their work comes to you without names, oldest first.
      </p>
      <div className="rise mt-6" style={riseAt(1)}>
        <p className="text-subhead mb-2 text-label-2">What people see</p>
        <TaskCard challenge={challenge} companies={companies} href={`/challenges/${encodeURIComponent(challenge.id)}`} />
      </div>
      <div className="rise mt-8 flex flex-col gap-3 min-[900px]:flex-row min-[900px]:items-center" style={riseAt(2)}>
        <Button href={challengeHref(challenge.id)} className="min-[900px]:w-auto! min-[900px]:px-8">
          See this challenge
        </Button>
        <Button href="/employer" variant="secondary" className="min-[900px]:w-auto! min-[900px]:px-6">
          My challenges
        </Button>
        <Button variant="quiet" size="sm" onClick={onStartOver}>
          New challenge
        </Button>
      </div>
    </>
  );
}
