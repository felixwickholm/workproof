import Link from "next/link";
import { Plus } from "lucide-react";
import type { EmployerHome } from "@/lib/domain/types";
import { taskMeta } from "../proof";
import { Button } from "../ui/button";
import { Panel } from "../ui/card";
import { cx } from "../ui/cx";
import { EmptyState } from "../ui/empty-state";
import { ProofKindIcon } from "../ui/proof-kind";
import { liveFor, taskPlacesLine } from "./employer-format";

/** "Your tasks": each live task with how long it has run, its places left, the proofs it brought and how many wait. */
export function TasksPanel({ tasks, className }: { tasks: EmployerHome["tasks"]; className?: string }) {
  return (
    <Panel title="Your tasks" count={tasks.length} className={cx("flex flex-col", className)}>
      {tasks.length === 0 ? (
        <EmptyState>No live task yet. One sentence is enough to post one.</EmptyState>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map(({ challenge, proofsReceived, waiting, daysLive, places, placesLeft }) => (
            <li key={challenge.id}>
              <Link
                href={`/challenges/${encodeURIComponent(challenge.id)}`}
                className="press flex min-h-[63px] items-center gap-3 rounded-[14px] bg-raised px-4 py-2.5 shadow-[inset_0_0_0_1px_var(--color-separator)] transition-shadow duration-150 hover:shadow-[inset_0_0_0_1px_var(--color-control)]"
              >
                <ProofKindIcon kind={challenge.proofKind} className="size-[18px] text-label-2" />
                <span className="min-w-0 flex-1">
                  <span className="text-subhead block truncate font-semibold text-label">{challenge.title}</span>
                  <span className="text-footnote tnum block truncate text-label-2">
                    {taskMeta(challenge.minutes, challenge.proofKind)} · {liveFor(daysLive)}
                  </span>
                  <span className="text-footnote tnum block truncate text-label-2">{taskPlacesLine(placesLeft, places)}</span>
                </span>
                <span className="tnum shrink-0 text-right">
                  <span className="text-subhead block text-label">{proofsReceived} received</span>
                  <span className="text-footnote block text-label-2">{waiting} waiting</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto pt-4">
        <Button href="/company" variant="secondary" size="sm">
          <Plus aria-hidden className="-ml-1 size-4" strokeWidth={2} />
          Post a task
        </Button>
      </div>
    </Panel>
  );
}
