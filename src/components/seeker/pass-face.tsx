import type { CSSProperties, ReactNode } from "react";
import { TimeAgo } from "@/components/proof";
import { CompanyMark, hueFor } from "@/components/ui/avatar";
import { cx } from "@/components/ui/cx";
import { ProofKindIcon, PROOF_KIND_LABEL } from "@/components/ui/proof-kind";
import { Tag } from "@/components/ui/tag";
import type { PassportEntry } from "@/lib/domain/types";
import { passState } from "./pass-state";

/** The strip that shows when a pass sits behind another: 64px tall. */
export const STRIP_PX = 64;
/** A whole pass, as on a wallet: 220px tall. */
export const PASS_PX = 220;

/** Who posted the task a pass belongs to. Several companies for a shared task. */
export type PassOwners = { id: string; name: string }[];

/** "Read by 2 people", "Not opened yet". */
export function seenLine(seen: number): string {
  if (seen === 0) return "Not opened yet";
  return `Read by ${seen} ${seen === 1 ? "person" : "people"}`;
}

/** "Kaari Home Care", "Kaari Home Care and Otso Health", or "Practice" for a task no company reads. */
export function ownerLine(entry: Pick<PassportEntry, "challenge">, owners: PassOwners): string {
  if (entry.challenge.kind === "taster") return "Practice";
  return owners.map((o) => o.name).join(" and ") || "An Espoo employer";
}

/**
 * One proof as a pass. The 64px strip carries the kind, the label and the state, so a pass behind
 * another still says where it stands; the face below names the task, who posted it, and when it
 * was sent and read. Each pass is tinted, quietly, in the stable hue of its employer.
 */
export function PassFace({ entry, owners, className }: { entry: PassportEntry; owners: PassOwners; className?: string }) {
  const { proof, challenge, seenByHumans } = entry;
  const state = passState(entry);
  const owner = challenge.kind === "taster" ? undefined : owners[0];
  return (
    <div
      className={cx("relative isolate flex flex-col overflow-hidden rounded-card bg-raised shadow-[inset_0_0_0_1px_var(--color-separator)]", className)}
      style={{ height: PASS_PX }}
    >
      {owner ? <span aria-hidden className="mark-tint absolute inset-0 -z-10 opacity-40" style={{ "--h": hueFor(owner.id) } as CSSProperties} /> : null}
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
        <ProofKindIcon kind={proof.proofKind} className="text-label-2" />
        <span className="text-subhead font-semibold whitespace-nowrap text-label">{proof.label}</span>
        <span className="text-footnote hidden whitespace-nowrap text-label-2 min-[420px]:inline">{PROOF_KIND_LABEL[proof.proofKind]}</span>
        <Tag tone={state.tone} className="ml-auto h-6 min-w-0 shrink px-2.5 text-caption">
          <span className="truncate">{state.label}</span>
        </Tag>
      </div>
      <div className="flex min-h-0 flex-1 flex-col border-t border-label/[0.08] px-5 pt-3.5 pb-4">
        <p className="text-headline line-clamp-2 font-semibold text-pretty text-label">{challenge.title}</p>
        <p className="text-footnote mt-2 flex min-w-0 items-center gap-2 text-label">
          {owner ? <CompanyMark company={owner} size="sm" /> : null}
          <span className="truncate">{ownerLine(entry, owners)}</span>
        </p>
        {/* Boarding-pass fields: a grey label over its value. */}
        <dl className="mt-auto flex gap-5 pr-16 min-[480px]:gap-6">
          <PassField label="Sent" value={<TimeAgo at={proof.submittedAt} />} />
          <PassField label="Read by" value={seenByHumans === 0 ? "No one yet" : `${seenByHumans} ${seenByHumans === 1 ? "person" : "people"}`} />
          <PassField label="Task" value={`${challenge.minutes} min`} className="max-[479px]:hidden" />
        </dl>
      </div>
    </div>
  );
}

function PassField({ label, value, className }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div className={cx("min-w-0", className)}>
      <dt className="text-caption text-label-2">{label}</dt>
      <dd className="text-subhead tnum font-medium whitespace-nowrap text-label">{value}</dd>
    </div>
  );
}

/** Looks up who posted each pass's task, from the task feed the home already holds. */
export function ownersFrom(tasks: readonly { challenge: { id: string }; companies: { id: string; name: string }[] }[]) {
  const byTask = new Map(tasks.map((t) => [t.challenge.id, t.companies.map((c) => ({ id: c.id, name: c.name }))]));
  return (entry: Pick<PassportEntry, "challenge">): PassOwners => byTask.get(entry.challenge.id) ?? [];
}
