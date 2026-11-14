"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { CityActions } from "@/lib/service/city-actions";
import { CompanyMark } from "../ui/avatar";
import { Button } from "../ui/button";
import { Panel } from "../ui/card";
import { cx } from "../ui/cx";
import { Sheet } from "../ui/sheet";
import { formatHours, plural } from "./format";

type Reminder = CityActions["reminders"][number];

/** Copies with the clipboard API, or by selecting the text where that API is blocked. */
async function copyText(text: string, field: HTMLTextAreaElement | null): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    if (!field) return false;
    field.select();
    return document.execCommand("copy");
  }
}

/** The reminder, editable, with one action: copy it into your own mail. */
function ReminderSheet({ reminder, onClose }: { reminder: Reminder | null; onClose: () => void }) {
  const [text, setText] = useState(reminder?.text ?? "");
  const [copied, setCopied] = useState<"yes" | "failed" | null>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const [shownFor, setShownFor] = useState(reminder?.companyId);
  if (reminder && shownFor !== reminder.companyId) {
    setShownFor(reminder.companyId);
    setText(reminder.text);
    setCopied(null);
  }

  useEffect(() => {
    if (copied !== "yes") return;
    const timer = window.setTimeout(() => setCopied(null), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => setCopied((await copyText(text, field.current)) ? "yes" : "failed");

  return (
    <Sheet open={reminder !== null} onClose={onClose} title={reminder ? `Reminder to ${reminder.companyName}` : "Reminder"}>
      <label htmlFor="reminder-text" className="text-footnote text-label-2">
        Edit the text if you like.
      </label>
      <textarea
        id="reminder-text"
        ref={field}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setCopied(null);
        }}
        rows={9}
        className="text-body mt-2 max-h-[46dvh] min-h-[180px] w-full resize-y field-sizing-content rounded-[16px] bg-surface px-4 py-3 text-label outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />
      <p className="text-footnote mt-3 text-pretty text-label-2">Workprint does not send messages in this demo. Copy the text into your own mail.</p>
      <div className="mt-5 flex flex-col gap-2 min-[480px]:flex-row-reverse">
        <Button onClick={copy} className="min-[480px]:w-auto min-[480px]:flex-1">
          {copied === "yes" ? <Check aria-hidden className="size-4" strokeWidth={2} /> : <Copy aria-hidden className="size-4" strokeWidth={1.8} />}
          {copied === "yes" ? "Copied" : "Copy text"}
        </Button>
        <Button variant="secondary" onClick={onClose} className="min-[480px]:w-auto min-[480px]:flex-1">
          Close
        </Button>
      </div>
      <p role="status" className={cx("text-footnote mt-2 text-label-2", copied !== "failed" && "sr-only")}>
        {copied === "yes" ? "Copied" : copied === "failed" ? "Copy did not work here. Select the text and copy it yourself." : ""}
      </p>
    </Sheet>
  );
}

/**
 * The organiser's side of "Answers owed": for each employer that still owes answers, a reminder to
 * draft and copy. Counts and task titles only; nothing about a person, and nothing is sent.
 */
export function OwedReminders({ actions, className }: { actions: CityActions | null; className?: string }) {
  const [open, setOpen] = useState<Reminder | null>(null);
  const reminders = actions?.reminders ?? [];

  return (
    <Panel title="Remind employers" count={reminders.length} className={cx("scroll-mt-6", className)}>
      <div id="reminders" className="scroll-mt-24" />
      <p className="text-subhead text-pretty text-label-2">
        {reminders.length > 0
          ? "Draft a reminder to an employer that still owes written answers. You send it from your own mail."
          : "No employer owes an answer right now."}
      </p>
      {reminders.length > 0 ? (
        <ul className="mt-4 grid grid-cols-1 gap-2 @min-[720px]:grid-cols-2">
          {reminders.map((r) => (
            <li key={r.companyId} className="flex flex-wrap items-center gap-x-3 gap-y-3 rounded-[16px] bg-raised px-4 py-3 shadow-[inset_0_0_0_1px_var(--color-separator)]">
              <CompanyMark company={{ id: r.companyId, name: r.companyName }} />
              <span className="min-w-[160px] flex-1">
                <span className="text-subhead block truncate font-medium text-label">{r.companyName}</span>
                <span className="text-footnote block text-label-2">
                  {plural(r.waiting, "answer")} owed · oldest waited {formatHours(r.oldestHours)}
                </span>
              </span>
              <Button variant="secondary" size="sm" onClick={() => setOpen(r)} className="max-[479px]:w-full">
                Draft a reminder
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
      <ReminderSheet reminder={open} onClose={() => setOpen(null)} />
    </Panel>
  );
}
