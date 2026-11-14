"use client";

import { ArrowUpRight, CalendarClock } from "lucide-react";
import { useRef, useState } from "react";
import { FeedbackQuote } from "@/components/proof";
import { CompanyMark } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cx } from "@/components/ui/cx";
import { api, currentTalentId, errorText } from "@/lib/client/api";
import type { SeekerInvitation } from "@/lib/domain/types";
import { BigButton } from "./gated-action";
import { acceptLine, bringLine, meetLabel } from "./invitation-words";
import { NameReveal } from "./name-reveal";

/** Plain public services a newcomer can read before the meeting. */
const BEFORE_YOU_MEET = [
  { label: "Work in Finland", href: "https://www.workinfinland.com" },
  { label: "International House Helsinki", href: "https://ihhelsinki.fi" },
  { label: "Business Espoo", href: "https://www.businessespoo.com" },
] as const;

interface Props {
  invitation: SeekerInvitation;
  /** The name the company sees after accepting. */
  personName: string;
  /** The person already said "We met"; the company has not confirmed yet. */
  confirmedByMe: boolean;
  onChanged: () => Promise<void>;
  tour?: string;
}

/**
 * One company's invitation. The reviewer's own words come first, because they are the reason.
 * Accepting is the moment the name is shown, so the card says it and shows the label become the name.
 * "Not now" asks once more before it is sent; the name is never shown after a no.
 */
export function InvitationCard({ invitation, personName, confirmedByMe, onChanged, tour }: Props) {
  const { companyName, sector, district, slot, status, proofLabel } = invitation;
  const [declining, setDeclining] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  async function act(action: (talentId: string) => Promise<unknown>) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      await action(await currentTalentId());
      await onChanged();
    } catch (e) {
      setError(errorText(e));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <article data-tour={tour} className="rounded-[18px] bg-raised p-4 shadow-[inset_0_0_0_1px_var(--color-separator)] min-[400px]:p-5">
      <FeedbackQuote
        reviewer={invitation.reviewer}
        companyName={companyName}
        feedback={invitation.feedback}
        decision="meet"
        viaSecondLook={invitation.viaSecondLook}
      />

      <div className="mt-5 flex items-center gap-3 border-t border-separator pt-4">
        <CompanyMark company={{ id: companyName, name: companyName }} />
        <div className="min-w-0 flex-1">
          <p className="text-subhead font-medium text-label">{companyName}</p>
          <p className="text-footnote text-label-2">
            {sector} · {district}
          </p>
        </div>
      </div>
      {status === "declined" ? null : (
        <p className="text-subhead tnum mt-3 flex items-center gap-2 text-label">
          <CalendarClock aria-hidden className="size-4 shrink-0 text-label-2" strokeWidth={1.7} />
          Proposed time: {slot}
        </p>
      )}

      {status === "invited" && declining ? (
        <div role="group" aria-label="Say not now" className="mt-5 rounded-inner bg-surface p-4">
          <p className="text-subhead text-pretty text-label">Say not now to {companyName}? They never see your name.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <BigButton variant="secondary" onClick={() => setDeclining(false)} className="w-full">
              Keep it
            </BigButton>
            <BigButton variant="secondary" loading={busy} onClick={() => act((id) => api.declineMeeting(invitation.meetingId, id))} className="w-full">
              Not now
            </BigButton>
          </div>
        </div>
      ) : status === "invited" ? (
        <>
          <div className="mt-5 grid grid-cols-[2fr_3fr] gap-2">
            <BigButton variant="secondary" onClick={() => setDeclining(true)} className="w-full px-3! whitespace-nowrap">
              Not now
            </BigButton>
            <BigButton loading={busy} onClick={() => act((id) => api.acceptMeeting(invitation.meetingId, id))} className="w-full px-3! whitespace-nowrap">
              {meetLabel(slot)}
            </BigButton>
          </div>
          <p className="text-footnote mt-2.5 text-center text-pretty text-label-2">{acceptLine(companyName)}</p>
        </>
      ) : status === "declined" ? (
        <div className="mt-5 rounded-inner bg-surface p-4">
          <p className="text-subhead text-pretty text-label">You said not now. {companyName} never sees your name; it saw only {proofLabel}.</p>
        </div>
      ) : (
        <div className="mt-5 rounded-inner bg-surface p-4">
          {status === "accepted" ? (
            <p className="text-subhead text-pretty text-label">
              {companyName} now sees your name. Before this moment they saw only {proofLabel}.
            </p>
          ) : (
            <p className="text-subhead text-pretty text-label">You met {companyName}. Both sides confirmed it.</p>
          )}
          <p className="text-footnote mt-2 text-label-2">
            What {companyName} sees: <NameReveal from={proofLabel} to={personName} className="font-medium text-label" />
          </p>
          {status === "accepted" ? <p className="text-subhead mt-3 text-pretty text-label">{bringLine(invitation.reviewer)}</p> : null}
          {status === "accepted" ? (
            confirmedByMe ? (
              <p className="text-footnote mt-3 text-label-2">You said you met. Waiting for {companyName} to confirm.</p>
            ) : (
              <Button variant="secondary" size="sm" loading={busy} onClick={() => act((id) => api.confirmMeeting(invitation.meetingId, id))} className="mt-3">
                We met
              </Button>
            )
          ) : null}
        </div>
      )}

      {error ? (
        <p role="alert" className="text-footnote mt-3 text-label-2">
          {error}
        </p>
      ) : null}

      {status === "accepted" || status === "met" ? (
        <div className="mt-5">
          <p className="text-footnote text-label-2">Useful before you meet</p>
          <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
            {BEFORE_YOU_MEET.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cx("text-subhead inline-flex items-center gap-1 font-medium text-label underline decoration-label-3 underline-offset-4 hover:decoration-label")}
                >
                  {link.label}
                  <ArrowUpRight aria-hidden className="size-3.5" strokeWidth={1.8} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
