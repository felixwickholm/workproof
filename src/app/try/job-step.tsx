"use client";

import { cx } from "@/components/ui/cx";
import { VoiceButton } from "@/components/voice";
import { LIMITS } from "@/lib/http/limits";
import { cleanSpokenJob, matchSuggestion, SUGGESTIONS } from "./try-copy";

interface Props {
  job: string;
  onJob: (job: string) => void;
  /** Starts the task; a chip passes its own job, so one tap is enough. */
  onStart: (job?: string) => void;
  /** The phone arrived with a table code the server does not know (any more). */
  tableInactive: boolean;
}

/** Said when a scanned code leads nowhere, so a visitor is never left wondering where the proof went. */
const INACTIVE_TABLE = "This table code is not active. You can still try the task: your proof stays on your phone's own demo.";

/** The first question: one big field with the voice button inside it, and eight jobs to tap. */
export function JobStep({ job, onJob, onStart, tableInactive }: Props) {
  const chosen = matchSuggestion(job);
  return (
    <>
      {tableInactive ? (
        <p role="status" className="text-subhead mb-5 rounded-inner bg-warning-wash px-4 py-3 text-pretty text-warning-ink">
          {INACTIVE_TABLE}
        </p>
      ) : null}
      <h1 className="text-greeting mt-2 text-balance text-label min-[900px]:text-[44px] min-[900px]:leading-[48px]">What&apos;s your dream job?</h1>
      <p className="text-body mt-2 text-pretty text-label-2">Get a 2-minute task from that job. Then see your work the way a company would.</p>

      <div className="mt-6 flex h-16 items-center rounded-inner bg-fill pr-2 shadow-[inset_0_0_0_1px_transparent] transition-shadow duration-150 focus-within:shadow-[inset_0_0_0_1.5px_var(--color-label-3)]">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Dream job</span>
          <input
            value={job}
            onChange={(e) => onJob(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onStart();
              }
            }}
            autoFocus
            maxLength={LIMITS.dreamJob}
            enterKeyHint="go"
            autoComplete="off"
            autoCapitalize="sentences"
            placeholder="Type any dream job"
            className="h-16 w-full bg-transparent pl-5 text-[22px] leading-7 font-medium text-label caret-accent outline-none placeholder:font-normal placeholder:text-label-3"
          />
        </label>
        <VoiceButton
          label="Say it"
          title="Say your dream job"
          prompt="What's your dream job?"
          maxSeconds={15}
          maxLength={LIMITS.dreamJob}
          onUse={(text) => onJob(cleanSpokenJob(text))}
          className="shrink-0 gap-2 pr-3"
        />
      </div>

      <ul aria-label="Or tap a job" className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => {
                onJob(s);
                onStart(s);
              }}
              aria-pressed={chosen === s}
              className={cx(
                "press text-subhead h-11 rounded-full px-4 font-medium transition-colors duration-150",
                chosen === s ? "bg-label text-ground" : "bg-surface text-label hover:bg-fill",
              )}
            >
              {s}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
