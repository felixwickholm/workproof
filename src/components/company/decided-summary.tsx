"use client";

import { CalendarClock, EyeOff } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { companyApi } from "@/lib/client/api";
import type { ReviewQueue } from "@/lib/domain/types";
import { Button } from "../ui/button";
import { HumanTag } from "../ui/tag";
import { companyErrorText } from "./format";

type Entry = ReviewQueue["decided"][number];

/** The decision a person made, and where the meeting stands. */
export function DecisionLine({ entry }: { entry: Entry }) {
  const { decision, meeting } = entry;
  if (decision.decision === "pass") return <p className="text-footnote font-semibold text-label-2">Passed, feedback sent</p>;
  if (meeting?.status === "met") return <HumanTag>Met, confirmed by both</HumanTag>;
  if (meeting?.status === "accepted") return <HumanTag>Meeting accepted</HumanTag>;
  return <HumanTag>Invited to meet</HumanTag>;
}

/** Feedback, meeting slot and, once they accept, the person's name and contact. */
export function DecidedDetails({ entry, onChanged }: { entry: Entry; onChanged: () => Promise<void> }) {
  const { decision, meeting, identity } = entry;
  const reduce = useReducedMotion();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inFlight = useRef(false);
  async function confirmMet() {
    if (!meeting || inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      await companyApi.confirmMet(meeting.id);
      await onChanged();
    } catch (e) {
      setError(companyErrorText(e));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  const accepted = meeting && meeting.status !== "invited";

  return (
    <div>
      <blockquote className="text-subhead rounded-inner bg-raised px-4 py-3 text-pretty">
        &ldquo;{decision.feedback}&rdquo;
        <footer className="text-footnote mt-1.5 text-label-2">{decision.reviewer}</footer>
      </blockquote>

      {meeting ? (
        <p className="text-subhead tnum mt-3 flex items-center gap-2 text-label-2">
          <CalendarClock aria-hidden className="size-4 shrink-0" strokeWidth={1.8} />
          {meeting.slot}
        </p>
      ) : null}

      {meeting && !accepted ? (
        <p className="text-subhead mt-2 flex items-center gap-2 text-label-2">
          <EyeOff aria-hidden className="size-4 shrink-0" strokeWidth={1.8} />
          Name appears when they accept
        </p>
      ) : null}

      <AnimatePresence initial={false}>
        {accepted && identity ? (
          <motion.div
            key="identity"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            className="highlight mt-3 flex items-center gap-3 rounded-inner bg-raised p-3 pl-4"
          >
            <div className="min-w-0 flex-1">
              <p className="text-headline truncate font-semibold">{identity.name || "Name not given"}</p>
              <p className="text-subhead truncate text-label-2">{identity.contact || "No contact given"}</p>
            </div>
            {meeting.companyConfirmedMet ? null : (
              <Button size="sm" loading={busy} onClick={confirmMet}>
                We met
              </Button>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {meeting && meeting.companyConfirmedMet && !meeting.talentConfirmedMet ? (
        <p className="text-footnote mt-2 text-label-2">You confirmed. Waiting for them to confirm too.</p>
      ) : null}
      {error ? (
        <p role="alert" className="text-footnote mt-2 text-label-2">
          {error}
        </p>
      ) : null}
    </div>
  );
}
