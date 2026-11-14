"use client";

import { BlindCompare, CHECK_HINT } from "@/components/proof";
import { ChooseCards } from "@/components/seeker/work/choose-cards";
import { AnswerQuote } from "./answer-quote";
import { TaskMaterial } from "./task-material";
import { TextArea } from "@/components/ui/field";
import { SpokenBadge, VoiceButton } from "@/components/voice";
import type { Challenge } from "@/lib/domain/types";
import { LIMITS } from "@/lib/http/limits";
import type { BlindPreview } from "@/lib/service/preview";
import { clipForDisplay, compareTexts, inSentence } from "./try-copy";
import type { Answer } from "./try-state";

/** Typing keeps the spoken mark while the words came from the voice; clearing the field drops it. */
const typed = (current: Answer, text: string): Answer => ({ text, spoken: current.spoken && text.trim().length > 0 });

function AnswerInput({ label, prompt, voiceLabel, value, onChange, max, autoFocus }: {
  label: string;
  prompt: string;
  voiceLabel: string;
  value: Answer;
  onChange: (answer: Answer) => void;
  max: number;
  autoFocus?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <TextArea label={label} hideLabel value={value.text} onChange={(text) => onChange(typed(value, text))} placeholder="Two or three sentences is enough" minRows={4} maxLength={max} autoFocus={autoFocus} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <VoiceButton label={voiceLabel} title={voiceLabel} prompt={prompt} maxLength={max} onUse={(text) => onChange({ text, spoken: true })} />
        {value.spoken ? <SpokenBadge /> : null}
      </div>
    </div>
  );
}

/**
 * The task: what happened, the one question, the material, and for a Choose task its two options.
 * A note says so when no task fits the job exactly.
 */
export function TaskStep({ challenge, job, generic, answer, onAnswer, choice, onChoice }: {
  challenge: Challenge;
  job: string;
  /** No task exists for this exact job; this one practises something many jobs share. */
  generic: boolean;
  answer: Answer;
  onAnswer: (answer: Answer) => void;
  choice: "a" | "b" | undefined;
  onChoice: (id: "a" | "b") => void;
}) {
  return (
    <>
      {generic ? (
        <p className="text-subhead mb-4 rounded-inner bg-surface px-4 py-3 text-pretty text-label-2">
          No {inSentence(clipForDisplay(job))} task yet. Here is a task many jobs share.
        </p>
      ) : null}
      <h1 className="text-title mb-4 font-semibold text-pretty text-label">{challenge.title}</h1>
      <TaskMaterial challenge={challenge} />
      {challenge.options ? (
        <div className="mt-6">
          <ChooseCards options={challenge.options} picked={choice} onPick={onChoice} />
        </div>
      ) : null}
      <div className="mt-6">
        <AnswerInput label="Your answer" prompt={challenge.deliverable} voiceLabel="Say your answer" value={answer} onChange={onAnswer} max={LIMITS.answer} />
        {challenge.aiAllowed ? <p className="text-footnote mt-3 text-label-2">AI allowed. Use it the way you would at work.</p> : null}
      </div>
    </>
  );
}

/** One question about the person's own answer, so the work shows their thinking. */
export function ExplainStep({ question, answer, explain, onExplain }: { question: string; answer: string; explain: Answer; onExplain: (answer: Answer) => void }) {
  return (
    <>
      <p className="text-footnote text-label-2">One question about your answer</p>
      <h1 className="text-title-3 mt-1 mb-5 font-semibold text-pretty text-label">{question}</h1>
      <AnswerQuote text={answer} />
      <AnswerInput label="Your explanation" prompt={question} voiceLabel="Say it instead" value={explain} onChange={onExplain} max={LIMITS.explain} autoFocus />
    </>
  );
}

/** First name only, and optional. Given, it shows the person their own name being hidden. */
export function NameStep({ name, onName, onContinue }: { name: string; onName: (name: string) => void; onContinue: () => void }) {
  return (
    <>
      <h1 className="text-title mt-2 font-semibold text-pretty text-label">What should we call you?</h1>
      <p className="text-body mt-2 text-pretty text-label-2">First name only. It is used to hide it and is not kept, so you can watch it being hidden.</p>
      <label className="mt-6 block">
        <span className="sr-only">First name</span>
        <input
          value={name}
          onChange={(e) => onName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onContinue();
            }
          }}
          autoFocus
          autoComplete="given-name"
          enterKeyHint="next"
          maxLength={LIMITS.name}
          placeholder="First name"
          className="h-14 w-full rounded-inner bg-fill px-5 text-[20px] leading-7 text-label caret-accent outline-none shadow-[inset_0_0_0_1px_transparent] transition-shadow duration-150 placeholder:text-label-3 focus:shadow-[inset_0_0_0_1.5px_var(--color-label-3)]"
        />
      </label>
      <p className="text-footnote mt-3 text-label-2">No email or phone number. This is practice.</p>
    </>
  );
}

/** What a company would read, before anything is sent. The person can go back and take out what the rules missed. */
export function CheckStep({ written, preview, onEdit }: { written: { answer: string; explain: string }; preview: BlindPreview; onEdit: () => void }) {
  const { original, blind } = compareTexts(written, preview);
  return (
    <>
      <h1 className="text-title mt-2 font-semibold text-pretty text-label">What the company will read</h1>
      <p className="text-body mt-2 mb-5 text-pretty text-label-2">Check it before you send. Nothing reaches a company until you press Send.</p>
      <BlindCompare original={original} blind={blind} hiddenCount={preview.hiddenCount} labels={["What you wrote", "What the company will read"]} initialSide="blind" />
      <p className="text-subhead mt-5 text-pretty text-label">{CHECK_HINT}</p>
      <button type="button" onClick={onEdit} className="press text-subhead mt-1 min-h-11 self-start font-medium text-label underline decoration-label-3 underline-offset-4">
        Back to edit
      </button>
    </>
  );
}
