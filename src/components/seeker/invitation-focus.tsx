"use client";

import { CalendarClock } from "lucide-react";
import { useRef, useState } from "react";
import { api, currentTalentId, errorText } from "@/lib/client/api";
import type { PassportEntry, SeekerInvitation } from "@/lib/domain/types";
import { Button } from "../ui/button";
import { ScoreView } from "./score-view";

interface Props {
  invitation: SeekerInvitation;
  /** The scored response behind the invitation, for the score and the skills. */
  response?: PassportEntry["responses"][number];
  /** The person already said "We met"; the company has not confirmed yet. */
  confirmedByMe: boolean;
  onChanged: () => Promise<void>;
  tour?: string;
}

/**
 * The one focal thing on the home when a company invites: who, the reviewer's own two sentences, the
 * score a person gave, the time, and two big buttons. Saying yes is the moment the name is shown.
 */
export function InvitationFocus({ invitation, response, confirmedByMe, onChanged, tour }: Props) {
  const { companyName, reviewer, feedback, slot, status } = invitation;
  const [busy, setBusy] = useState<"yes" | "no" | "met" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  async function act(which: "yes" | "no" | "met", action: (talentId: string) => Promise<unknown>) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(which);
    setError(null);
    try {
      await action(await currentTalentId());
      await onChanged();
    } catch (e) {
      setError(errorText(e));
    } finally {
      inFlight.current = false;
      setBusy(null);
    }
  }

  return (
    <article data-tour={tour} aria-label={`Invitation from ${companyName}`} className="rounded-card bg-surface p-6 min-[900px]:p-8">
      <div className="grid gap-8 min-[900px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="min-w-0">
          <h2 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] text-pretty text-label">Your invite</h2>
          <blockquote className="mt-4 font-serif text-[24px] leading-[32px] text-pretty text-label">&ldquo;{feedback}&rdquo;</blockquote>
          <p className="text-body mt-3 text-label-2">
            {reviewer}, {companyName}
          </p>
          {status === "declined" ? null : (
            <p className="text-body tnum mt-6 flex items-center gap-2 text-label">
              <CalendarClock aria-hidden className="size-5 shrink-0 text-label-2" strokeWidth={1.75} />
              {slot}
            </p>
          )}
        </div>
        {response?.scores?.length && response.total !== undefined ? (
          <div className="min-w-0 border-separator max-[899px]:border-t max-[899px]:pt-6 min-[900px]:border-l min-[900px]:pl-8">
            <p className="text-body text-label-2">Your score</p>
            <ScoreView total={response.total} scores={response.scores} size="md" className="mt-1" />
          </div>
        ) : null}
      </div>

      <div className="mt-8 border-t border-separator pt-6">
        {status === "invited" ? (
          <>
            <div className="grid grid-cols-1 gap-3 min-[560px]:grid-cols-2 min-[900px]:max-w-[560px]">
              <Button loading={busy === "yes"} onClick={() => act("yes", (id) => api.acceptMeeting(invitation.meetingId, id))} className="h-14! text-[18px]!">
                Say yes
              </Button>
              <Button variant="secondary" loading={busy === "no"} onClick={() => act("no", (id) => api.declineMeeting(invitation.meetingId, id))} className="h-14! text-[18px]!">
                Not now
              </Button>
            </div>
            <p className="text-body mt-3 text-label-2">Saying yes shows your name to {companyName} only.</p>
          </>
        ) : status === "declined" ? (
          <p className="text-body text-label">You said not now. {companyName} never sees your name.</p>
        ) : status === "accepted" ? (
          <div className="flex flex-col gap-3 min-[560px]:flex-row min-[560px]:items-center min-[560px]:justify-between">
            <p className="text-body text-label">You said yes. {companyName} now sees your name.</p>
            {confirmedByMe ? (
              <p className="text-body text-label-2">You said you met. {companyName} still has to confirm.</p>
            ) : (
              <Button variant="secondary" size="sm" loading={busy === "met"} onClick={() => act("met", (id) => api.confirmMeeting(invitation.meetingId, id))}>
                We met
              </Button>
            )}
          </div>
        ) : (
          <p className="text-body text-label">You met {companyName}. You both said so.</p>
        )}
        {error ? (
          <p role="alert" className="text-body mt-3 text-label-2">
            {error}
          </p>
        ) : null}
      </div>
    </article>
  );
}
