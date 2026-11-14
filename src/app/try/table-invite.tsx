"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useRef, useState } from "react";
import { LockedButton } from "@/components/controls/locked-button";
import { ApiError, errorText } from "@/lib/client/api";
import { MAX_SHOWN_NAME, shownNameProblem } from "@/lib/service/table-rules";
import type { PhoneInvite } from "./use-table-invite";

interface Props {
  invite: PhoneInvite;
  /** The first name typed earlier in this flow, if any. It stayed in this page's memory only. */
  firstName: string;
  onAccept: (firstName: string) => Promise<void>;
  onDecline: () => Promise<void>;
}

const EASE = [0.23, 1, 0.32, 1] as const;

/**
 * The table's invitation on the person's own phone: who asked, in their own words, and the choice.
 * It slides up once when it arrives. Accepting is the only way a name reaches the big screen.
 */
export function TableInviteCard({ invite, firstName, onAccept, onDecline }: Props) {
  const reduce = useReducedMotion();
  const arrive = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.25 } }
    : { initial: { opacity: 0, transform: "translateY(32px)" }, animate: { opacity: 1, transform: "translateY(0px)" }, transition: { type: "spring" as const, duration: 0.5, bounce: 0.2 } };

  return (
    <motion.section aria-label="Invitation from the table" className="pb-1" {...arrive}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={invite.status}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE }}
        >
          {invite.status === "invited" ? (
            <Choice invite={invite} firstName={firstName} onAccept={onAccept} onDecline={onDecline} />
          ) : invite.status === "accepted" ? (
            <div role="status" className="py-1">
              <p className="font-serif text-[34px] leading-[38px] text-label">Look up.</p>
              <p className="text-subhead mt-1 text-pretty text-label-2">Your first name is on the big screen now, next to your proof. It got there because you said yes.</p>
            </div>
          ) : (
            <div role="status" className="py-1">
              <p className="text-headline font-semibold text-label">Fine. Your name was never shown.</p>
              <p className="text-subhead mt-1 text-pretty text-label-2">The table only sees that you said not now.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
}

function Choice({ invite, firstName, onAccept, onDecline }: Props) {
  const [name, setName] = useState(firstName);
  const [busy, setBusy] = useState<"accept" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const reasonId = useId();
  const problem = shownNameProblem(name);

  async function run(kind: "accept" | "decline") {
    if (inFlight.current || (kind === "accept" && problem)) return;
    inFlight.current = true;
    setBusy(kind);
    setError(null);
    try {
      await (kind === "accept" ? onAccept(name.trim()) : onDecline());
    } catch (e) {
      setError(e instanceof ApiError && e.status === 409 ? e.message : errorText(e));
    } finally {
      inFlight.current = false;
      setBusy(null);
    }
  }

  return (
    <>
      <p role="status" className="text-headline font-semibold text-pretty text-label">
        {invite.host} at the table wants to meet you.
      </p>
      <blockquote className="mt-2 line-clamp-4 border-l-2 border-accent pl-3 font-serif text-[19px] leading-[25px] text-pretty text-label">
        {invite.message}
      </blockquote>
      <p className="text-footnote mt-2 text-pretty text-label-2">Only your blind proof was visible. If you accept, your first name appears on the big screen.</p>
      <label className="mt-3 block">
        <span className="sr-only">Your first name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="given-name"
          enterKeyHint="done"
          maxLength={MAX_SHOWN_NAME}
          placeholder="Your first name"
          className="text-body h-12 w-full rounded-inner bg-fill px-4 text-label caret-accent outline-none shadow-[inset_0_0_0_1px_transparent] transition-shadow duration-150 placeholder:text-label-3 focus:shadow-[inset_0_0_0_1.5px_var(--color-label-3)]"
        />
      </label>
      <div className="mt-2.5 grid grid-cols-2 gap-2.5">
        <LockedButton tone="neutral" locked={false} busy={busy === "decline"} onClick={() => void run("decline")} className="px-3">
          Not now
        </LockedButton>
        <LockedButton tone="meet" locked={problem !== undefined} busy={busy === "accept"} reasonId={reasonId} onClick={() => void run("accept")} className="px-3 text-[15px] leading-5">
          Accept and show my name
        </LockedButton>
      </div>
      <p id={reasonId} aria-live="polite" className="text-footnote mt-2 min-h-[18px] text-center text-pretty text-label-2">
        {error ?? problem ?? "Your name shows on this table's screen only."}
      </p>
    </>
  );
}
