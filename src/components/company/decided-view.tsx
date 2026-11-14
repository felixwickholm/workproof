"use client";

import { CalendarClock, EyeOff } from "lucide-react";
import { useRef, useState } from "react";
import { companyApi } from "@/lib/client/api";
import { FeedbackQuote } from "../proof";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { HumanTag } from "../ui/tag";
import { DECLINED_LINE, decidedLine, nameShown, type DecidedEntry } from "./decision-words";
import { companyErrorText } from "./format";
import { NameReveal } from "./name-reveal";

interface Props {
  entry: DecidedEntry;
  companyName: string;
  onChanged: () => Promise<void>;
  tour?: string;
}

/**
 * A proof the company already answered: the words it sent, the meeting slot for a Meet, and,
 * only once the person accepted, who they are. Then both sides confirm the meeting happened.
 */
export function DecidedView({ entry, companyName, onChanged, tour }: Props) {
  const { decision, meeting, identity, proof } = entry;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  async function confirmMet() {
    if (!meeting || inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      await companyApi.confirmMet(meeting.id, meeting.companyId);
      await onChanged();
    } catch (e) {
      setError(companyErrorText(e));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <Card tour={tour} className="flex flex-col gap-5">
      {decision.decision === "meet" ? (
        <HumanTag>{decidedLine(entry)}</HumanTag>
      ) : (
        <p className="text-footnote font-semibold text-label-2">{decidedLine(entry)}</p>
      )}
      <FeedbackQuote reviewer={decision.reviewer} companyName={companyName} feedback={decision.feedback} decision={decision.decision} at={decision.decidedAt} />

      {meeting ? (
        <div className="flex flex-col gap-4 border-t border-separator pt-4">
          {meeting.status === "declined" ? null : (
            <p className="text-subhead tnum flex items-center gap-2 text-label">
              <CalendarClock aria-hidden className="size-[18px] shrink-0 text-label-2" strokeWidth={1.7} />
              Proposed time: {meeting.slot}
            </p>
          )}
          {nameShown(entry) && identity ? (
            <>
              <NameReveal label={proof.label} name={identity.name} contact={identity.contact} />
              <ConfirmLine companyConfirmed={meeting.companyConfirmedMet} talentConfirmed={meeting.talentConfirmedMet} busy={busy} onConfirm={confirmMet} />
            </>
          ) : (
            <p className="text-subhead flex items-center gap-2 text-label-2">
              <EyeOff aria-hidden className="size-[18px] shrink-0" strokeWidth={1.7} />
              {meeting.status === "declined" ? DECLINED_LINE : "The name stays hidden until the person accepts."}
            </p>
          )}
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-footnote text-label-2">
          {error}
        </p>
      ) : null}
    </Card>
  );
}

function ConfirmLine({ companyConfirmed, talentConfirmed, busy, onConfirm }: { companyConfirmed: boolean; talentConfirmed: boolean; busy: boolean; onConfirm: () => void }) {
  if (companyConfirmed && talentConfirmed) return <HumanTag>Met, confirmed by both</HumanTag>;
  if (companyConfirmed) return <p className="text-footnote text-label-2">You confirmed. Waiting for them to confirm too.</p>;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm" variant="secondary" loading={busy} onClick={onConfirm}>
        We met
      </Button>
      <p className="text-footnote text-label-2">Confirm after the meeting. The city counts meetings both sides confirm.</p>
    </div>
  );
}
