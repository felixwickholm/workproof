"use client";

import { EyeOff } from "lucide-react";
import { useRef, useState } from "react";
import { companyApi } from "@/lib/client/api";
import type { Challenge, ReviewQueue } from "@/lib/domain/types";
import { TimeAgo } from "../proof";
import { Button } from "../ui/button";
import { getReviewer } from "./company-choice";
import { companyErrorText } from "./format";
import { formatTotal, rowState, workCode } from "./hiring-words";
import { NameReveal } from "./name-reveal";
import { SkillMarks } from "./skill-marks";

type Entry = ReviewQueue["decided"][number];

interface Props {
  entry: Entry;
  challenge: Challenge | null;
  companyId: string;
  onChanged: () => Promise<void>;
}

/**
 * Work this company scored: the total and each skill, the words sent to the person, and where it stands.
 * A work scored only can still be invited or set aside here. Once the person said yes, their name shows;
 * after the talk, the company says whether a follow-up was agreed.
 */
export function ScoredView({ entry, challenge, companyId, onChanged }: Props) {
  const { decision, meeting, identity, proof } = entry;
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  async function act(key: string, action: () => Promise<unknown>) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(key);
    setError(null);
    try {
      await action();
      await onChanged();
    } catch (e) {
      setError(companyErrorText(e));
    } finally {
      inFlight.current = false;
      setBusy(null);
    }
  }

  const decideHold = (kind: "meet" | "pass") => act(kind, () => companyApi.decideHold(decision.id, { decision: kind, reviewer: getReviewer(companyId) }));
  const named = identity && meeting && (meeting.status === "accepted" || meeting.status === "met");
  const bothMet = meeting && meeting.companyConfirmedMet && meeting.talentConfirmedMet;

  return (
    <section data-tour="score" aria-label="Your score" className="flex flex-col gap-6 rounded-card bg-surface p-5 min-[900px]:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-section text-label">Your score</h2>
          <p className="text-footnote mt-0.5 text-label-2">
            {decision.reviewer} · <TimeAgo at={decision.decidedAt} />
          </p>
        </div>
        {typeof decision.total === "number" ? (
          <p className="tnum text-[40px] leading-[44px] font-normal text-label">
            {formatTotal(decision.total)}
            <span className="text-subhead ml-1 text-label-2">of 10</span>
          </p>
        ) : null}
      </div>

      {decision.scores && challenge ? <SkillMarks scores={decision.scores} skills={challenge.coreSkills} /> : null}

      <figure>
        <figcaption className="text-footnote text-label-2">Your words to the person</figcaption>
        <blockquote className="mt-1 font-serif text-[20px] leading-[28px] text-pretty text-label">&ldquo;{decision.feedback}&rdquo;</blockquote>
      </figure>

      <div className="border-t border-separator pt-5">
        <p className="text-headline font-semibold text-label">{rowState(entry)}</p>
        {decision.decision === "hold" ? (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Button variant="secondary" loading={busy === "pass"} onClick={() => void decideHold("pass")}>
              Not now
            </Button>
            <Button loading={busy === "meet"} onClick={() => void decideHold("meet")}>
              Invite to the event
            </Button>
          </div>
        ) : null}

        {meeting && named && identity ? (
          <div className="mt-4 flex flex-col gap-4">
            <NameReveal label={workCode(proof.label)} name={identity.name} contact={identity.contact} />
            {!meeting.companyConfirmedMet ? (
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm" variant="secondary" loading={busy === "met"} onClick={() => void act("met", () => companyApi.confirmMet(meeting.id, meeting.companyId))}>
                  We met
                </Button>
                <p className="text-footnote text-label-2">Press after the talk. The city counts talks both sides confirm.</p>
              </div>
            ) : !bothMet ? (
              <p className="text-subhead text-label-2">You confirmed. Waiting for the person to confirm too.</p>
            ) : meeting.followUpAgreed === undefined ? (
              <div>
                <p className="text-subhead text-label">Did you agree a follow-up?</p>
                <div className="mt-2 flex gap-3">
                  <Button size="sm" variant="secondary" loading={busy === "no"} onClick={() => void act("no", () => companyApi.followUp(meeting.id, companyId, false))}>
                    No
                  </Button>
                  <Button size="sm" loading={busy === "yes"} onClick={() => void act("yes", () => companyApi.followUp(meeting.id, companyId, true))}>
                    Yes, a follow-up
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : meeting ? (
          <p className="text-subhead mt-2 flex items-center gap-2 text-label-2">
            <EyeOff aria-hidden className="size-4 shrink-0" strokeWidth={1.75} />
            The name stays hidden until the person says yes.
          </p>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-footnote text-label">
          {error}
        </p>
      ) : null}
    </section>
  );
}
