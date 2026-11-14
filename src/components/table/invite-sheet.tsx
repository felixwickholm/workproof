"use client";

import { useId, useRef, useState } from "react";
import { api, ApiError, errorText } from "@/lib/client/api";
import type { TableProof } from "@/lib/domain/types";
import { LIMITS } from "@/lib/http/limits";
import { inviteCheck } from "@/lib/service/table-rules";
import { LockedButton } from "@/components/controls/locked-button";
import { MIN_SENTENCES } from "@/lib/domain/feedback-check";
import { cx } from "../ui/cx";
import { Field, TextArea } from "../ui/field";
import { Sheet } from "../ui/sheet";
import { readHostName, saveHostName } from "./host-name";

/** Said plainly: this screen demonstrates consent and the name, not reading the work. */
const PUBLIC_SCREEN_NOTE = "On this public screen the work stays hidden. At a real event the employer reads the blind work first, then invites.";

/** A refusal the host can act on (two sentences, already invited) is shown in the server's own words. */
function inviteErrorText(error: unknown): string {
  if (error instanceof ApiError && (error.status === 400 || error.status === 409)) return error.message;
  return errorText(error);
}

/**
 * The host's invitation to the author of one row: their name, then two sentences under the same rule
 * as an employer's decision. The person reads it on their own phone and decides there.
 */
export function InviteSheet({ proof, onClose, onSent }: { proof: TableProof | null; onClose: () => void; onSent: () => void }) {
  return (
    <Sheet open={proof !== null} onClose={onClose} title={proof ? `Invite ${proof.label} to meet` : "Invite to meet"}>
      {proof ? <InviteForm key={proof.proofId} proof={proof} onClose={onClose} onSent={onSent} /> : null}
    </Sheet>
  );
}

function InviteForm({ proof, onClose, onSent }: { proof: TableProof; onClose: () => void; onSent: () => void }) {
  const [host, setHost] = useState(readHostName);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const reasonId = useId();
  const check = inviteCheck(host, message);
  const ready = check.waitingFor === null;

  async function send() {
    if (!ready || inFlight.current) return;
    inFlight.current = true;
    setSending(true);
    setError(null);
    try {
      saveHostName(host.trim());
      await api.inviteFromTable(proof.proofId, { host: host.trim(), message: message.trim() });
      onSent();
      onClose();
    } catch (e) {
      setError(inviteErrorText(e));
    } finally {
      inFlight.current = false;
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-subhead -mt-2 text-pretty text-label-2">{PUBLIC_SCREEN_NOTE}</p>
      <Field label="Your name" value={host} onChange={setHost} placeholder="The person at the table" autoComplete="name" maxLength={LIMITS.reviewer} />
      <div>
        <TextArea
          label="Write to the person: what you would like to hear more about"
          value={message}
          onChange={setMessage}
          placeholder="What you would like to hear more about, and why."
          minRows={3}
          maxLength={LIMITS.feedback}
        />
        <p className="text-footnote tnum mt-2 flex justify-between gap-3 text-label-2">
          <span className={cx("transition-colors duration-150", check.sentences >= MIN_SENTENCES && "text-label")}>
            {check.sentences} of {MIN_SENTENCES} sentences
          </span>
          <span>
            {check.characters} / {LIMITS.feedback}
          </span>
        </p>
      </div>
      <div>
        <LockedButton tone="primary" locked={!ready} busy={sending} reasonId={reasonId} onClick={() => void send()} className="w-full">
          Send invitation
        </LockedButton>
        <p id={reasonId} aria-live="polite" className="text-footnote mt-2 min-h-[18px] text-center text-pretty text-label-2">
          {check.waitingFor ?? "The person sees your words on their phone. Their name shows only if they accept."}
        </p>
        {error ? (
          <p role="alert" className="text-footnote mt-1 text-center text-pretty text-label-2">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
