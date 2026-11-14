"use client";

import { useState, type ReactNode } from "react";
import { LIMITS } from "@/lib/http/limits";
import { Button } from "../ui/button";
import { Field } from "../ui/field";
import { Sheet } from "../ui/sheet";

/** One button in the bottom bar. The name of the person who approves is asked in a sheet. */
export function ApproveBar({
  approvedBy,
  onApprovedBy,
  canPublish,
  busy,
  errorLine,
  onPublish,
}: {
  approvedBy: string;
  onApprovedBy: (name: string) => void;
  /** The draft itself is complete enough to publish. */
  canPublish: boolean;
  busy: boolean;
  errorLine: ReactNode;
  onPublish: () => void;
}) {
  const [open, setOpen] = useState(false);
  const named = approvedBy.trim().length > 0;
  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={!canPublish}>
        Approve as&hellip;
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Approve and publish">
        <p className="text-subhead mb-4 text-label-2 text-pretty">
          Your name goes on the task. Talent sees that a named person approved it.
        </p>
        <Field
          label="Approved by"
          value={approvedBy}
          onChange={onApprovedBy}
          placeholder="Your name"
          autoComplete="name"
          maxLength={LIMITS.approvedBy}
          autoFocus
          onEnter={named ? onPublish : undefined}
        />
        <div className="mt-5">
          {errorLine}
          <Button onClick={onPublish} disabled={!named || !canPublish} loading={busy}>
            Approve and publish
          </Button>
        </div>
      </Sheet>
    </>
  );
}
