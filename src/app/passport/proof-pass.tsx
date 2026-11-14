"use client";

import { Clock, Eye } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { formatLabel } from "@/components/problem-card";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/card";
import { HumanTag } from "@/components/ui/tag";
import { api, errorText } from "@/lib/client/api";
import { getTalentId } from "@/lib/client/local";
import type { PassportEntry } from "@/lib/domain/types";

type Response = PassportEntry["responses"][number];

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

/** One proof as a pass: header strip, the challenge, a small fact grid, then one row per company. */
export function ProofPass({ entry, onChanged }: { entry: PassportEntry; onChanged: () => Promise<void> }) {
  const { proof, challenge, seenByHumans, responses, sharedWith } = entry;
  const code = proof.label.replace(/^Proof\s*/i, "");

  return (
    <article className="highlight overflow-hidden rounded-card bg-surface">
      <header className="flex items-center gap-3 px-5 pt-5">
        <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-inner bg-raised font-mono text-subhead font-semibold">
          {code}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-headline font-semibold">{proof.label}</p>
          <p className="text-subhead tnum flex items-center gap-1.5 text-label-2">
            <Eye aria-hidden className="size-4 shrink-0" strokeWidth={1.8} />
            {seenByHumans === 0 ? "Not opened yet" : seenByHumans === 1 ? "Opened by a reviewer" : `Opened by ${seenByHumans} reviewers`}
          </p>
        </div>
      </header>

      <div className="px-5 pt-4 pb-5">
        <h2 className="text-title-3 font-semibold text-pretty">{challenge.title}</h2>
        <dl className="mt-4 grid grid-cols-3 gap-3">
          <Fact label="Task" value={formatLabel[challenge.format].replace(" task", "")} />
          <Fact label="Time" value={`${challenge.minutes} min`} />
          <Fact label="Sent" value={dateFormat.format(new Date(proof.submittedAt))} />
        </dl>
      </div>

      <Perforation />

      <ul className="[--row-inset:20px]">
        {responses.length === 0 ? (
          <li className="row relative flex min-h-14 items-center gap-3 px-5 py-3">
            <Clock aria-hidden className="size-5 shrink-0 text-label-2" strokeWidth={1.8} />
            <div>
              <p className="text-body">Waiting for a human review</p>
              <p className="text-subhead text-label-2">You get a decision with written feedback.</p>
            </div>
          </li>
        ) : (
          responses.map((r, i) => <ResponseRow key={`${r.companyName}-${i}`} response={r} onChanged={onChanged} />)
        )}
        {sharedWith.length > 0 ? (
          <li className="row relative px-5 py-3">
            <p className="text-subhead text-label-2">
              Also shown to: <span className="text-label">{sharedWith.join(", ")}</span> (Second look)
            </p>
          </li>
        ) : null}
      </ul>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>
        <Eyebrow className="text-label-3">{label}</Eyebrow>
      </dt>
      <dd className="text-headline tnum mt-1 font-semibold">{value}</dd>
    </div>
  );
}

/** The tear line of a pass: a hairline with a notch cut on each side. */
function Perforation() {
  return (
    <div aria-hidden className="relative h-4">
      <span className="absolute top-1/2 -left-2 size-4 -translate-y-1/2 rounded-full bg-ground" />
      <span className="absolute top-1/2 -right-2 size-4 -translate-y-1/2 rounded-full bg-ground" />
      <span className="absolute inset-x-5 top-1/2 h-[0.5px] bg-separator" />
    </div>
  );
}

function ResponseRow({ response, onChanged }: { response: Response; onChanged: () => Promise<void> }) {
  const { companyName, decision, feedback, viaSecondLook, meeting } = response;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inFlight = useRef(false);
  async function act(action: () => Promise<unknown>) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      await action();
      await onChanged();
    } catch (e) {
      setError(errorText(e));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  let status: ReactNode;
  let action: ReactNode = null;

  if (decision === "pass") {
    status = <p className="text-subhead text-label-2">Passed, with feedback</p>;
  } else if (!meeting || meeting.status === "invited") {
    status = <HumanTag>Wants to meet</HumanTag>;
    if (meeting) {
      action = (
        <Button size="sm" loading={busy} onClick={() => act(() => api.acceptMeeting(meeting.id, getTalentId()))}>
          Accept
        </Button>
      );
    }
  } else if (meeting.status === "met" || (meeting.talentConfirmedMet && meeting.companyConfirmedMet)) {
    status = <HumanTag>We met</HumanTag>;
  } else {
    status = <HumanTag>Meeting accepted</HumanTag>;
    if (!meeting.talentConfirmedMet) {
      action = (
        <Button size="sm" variant="secondary" loading={busy} onClick={() => act(() => api.confirmMeeting(meeting.id, getTalentId()))}>
          We met
        </Button>
      );
    }
  }

  return (
    <li className="row relative px-5 py-3.5">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-body text-pretty">{companyName}</p>
          <div className="mt-0.5">{status}</div>
          {viaSecondLook ? <p className="text-footnote text-label-2">Via Second look</p> : null}
        </div>
        {action}
      </div>

      {meeting && decision === "meet" ? (
        <p className="text-subhead tnum mt-2 text-label-2">{meeting.slot}</p>
      ) : null}
      {meeting && meeting.status !== "invited" ? (
        <p className="text-subhead mt-1 text-label-2">
          {meeting.status === "met" || (meeting.talentConfirmedMet && meeting.companyConfirmedMet)
            ? "Both sides confirmed the meeting."
            : meeting.talentConfirmedMet
              ? `Waiting for ${companyName} to confirm.`
              : "Your name is now visible to them."}
        </p>
      ) : null}
      {feedback ? (
        <blockquote className="text-subhead mt-3 rounded-inner bg-raised px-4 py-3 text-pretty">&ldquo;{feedback}&rdquo;</blockquote>
      ) : null}
      {error ? (
        <p role="alert" className="text-footnote mt-2 text-label-2">
          {error}
        </p>
      ) : null}
    </li>
  );
}
