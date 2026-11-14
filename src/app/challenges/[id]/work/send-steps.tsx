"use client";

import { CircleCheck } from "lucide-react";
import type { ReactNode } from "react";
import { BlindCompare, BlindText } from "@/components/proof";
import { BigButton, GatedAction } from "@/components/seeker/gated-action";
import { LocalReplay } from "@/components/think-aloud/local-replay";
import type { Replay } from "@/components/think-aloud/replays";
import { Field, TextArea } from "@/components/ui/field";
import { Screen } from "@/components/ui/screen";
import { Switch } from "@/components/ui/switch";
import { SpokenBadge, VoiceButton } from "@/components/voice";
import { LIMITS } from "@/lib/http/limits";

export interface Answers {
  questions: string[];
  given: { answer: string; spoken: boolean }[];
}

export interface Sender {
  as: "persona" | "me";
  name: string;
  contact: string;
  share: boolean;
}

/** What the company will read, from the same blind layer that runs on Send. Nothing is stored. */
export interface Preview {
  work: string;
  explain: { question: string; answer: string }[];
  transcript: string;
  original: string;
  originalTranscript: string;
  hiddenCount: number;
  /** Details hidden in the think-aloud. */
  transcriptHidden: number;
}

const SHARE_LABEL = "Let other companies with the same need see this work. They see the work, not your name.";

function Title({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mt-2 mb-8">
      <h1 className="text-[34px] leading-[40px] font-semibold tracking-[-0.02em] text-pretty text-label">{children}</h1>
      {sub ? <p className="text-body mt-2 text-pretty text-label-2">{sub}</p> : null}
    </div>
  );
}

function ErrorLine({ error }: { error: string | null }) {
  return error ? (
    <p role="alert" className="text-footnote mb-3 text-center text-label-2">
      {error}
    </p>
  ) : null;
}

/** Two short questions about the person's own choices, from the server. Write or say each answer. */
export function QuestionsStep({ answers, onAnswers, onBack, onNext }: { answers: Answers; onAnswers: (a: Answers) => void; onBack: () => void; onNext: () => void }) {
  const set = (i: number, value: { answer: string; spoken: boolean }) => onAnswers({ ...answers, given: answers.given.map((g, j) => (j === i ? value : g)) });
  return (
    <Screen back={{ onBack }} bottom={<GatedAction onClick={onNext} locked={answers.given.some((g) => !g.answer.trim())} reason="Answer both questions to go on.">Continue</GatedAction>}>
      <Title sub="About your own choices. Write a few lines, or say it.">Two questions</Title>
      <div className="flex flex-col gap-8">
        {answers.questions.map((question, i) => (
          <section key={question}>
            <h2 className="mb-3 text-[20px] leading-[28px] font-semibold text-pretty text-label">{question}</h2>
            <TextArea label={`Answer ${i + 1}`} hideLabel value={answers.given[i]?.answer ?? ""} onChange={(answer) => set(i, { answer, spoken: answer.trim() ? (answers.given[i]?.spoken ?? false) : false })} placeholder="A few lines is enough" minRows={3} maxLength={LIMITS.explain} />
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <VoiceButton label="Say it" title="Your answer" prompt={question} onUse={(answer) => set(i, { answer, spoken: true })} />
              {answers.given[i]?.spoken ? <SpokenBadge /> : null}
            </div>
          </section>
        ))}
      </div>
    </Screen>
  );
}

interface YouProps {
  sender: Sender;
  onSender: (s: Sender) => void;
  personaFirst: string;
  personaLine: string;
  company: string;
  busy: boolean;
  error: string | null;
  onBack: () => void;
  onNext: () => void;
}

/** Who you are, for after you say yes, and whether other companies may see the work. Sharing is off at first. */
export function YouStep({ sender, onSender, personaFirst, personaLine, company, busy, error, onBack, onNext }: YouProps) {
  const missing = sender.as === "me" && (!sender.name.trim() || !sender.contact.trim());
  return (
    <Screen
      back={{ onBack }}
      bottom={
        <>
          <ErrorLine error={error} />
          <GatedAction onClick={onNext} loading={busy} locked={missing} reason="Add your name and a way to reach you.">
            See what {company} will read
          </GatedAction>
        </>
      }
    >
      <Title sub={`${company} sees your name only if you say yes to an invite.`}>Who you are</Title>
      {sender.as === "persona" ? (
        <div className="rounded-card bg-surface p-5">
          <p className="text-body text-label">Sending as {personaFirst}, the demo person</p>
          <p className="text-footnote mt-1 text-label-2">{personaLine}</p>
          <button type="button" onClick={() => onSender({ ...sender, as: "me" })} className="press text-body mt-2 min-h-11 font-medium text-label underline decoration-label-3 underline-offset-4">
            Send as myself
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Field label="Name" value={sender.name} onChange={(name) => onSender({ ...sender, name })} placeholder="Your name" autoComplete="name" maxLength={LIMITS.name} />
          <Field label="Email or phone" type="email" value={sender.contact} onChange={(contact) => onSender({ ...sender, contact })} placeholder="you@example.org" autoComplete="email" maxLength={LIMITS.contact} />
          <button type="button" onClick={() => onSender({ ...sender, as: "persona" })} className="press text-body min-h-11 self-start font-medium text-label-2 underline decoration-label-3 underline-offset-4">
            Send as {personaFirst}, the demo person
          </button>
        </div>
      )}
      <div className="mt-6 flex items-center gap-4 rounded-card bg-surface px-5 py-4">
        <p className="text-body min-w-0 flex-1 text-pretty text-label">{SHARE_LABEL}</p>
        <Switch checked={sender.share} onChange={(share) => onSender({ ...sender, share })} label={SHARE_LABEL} />
      </div>
    </Screen>
  );
}

interface PreviewProps {
  preview: Preview;
  busy: boolean;
  error: string | null;
  onBack: () => void;
  onEdit: () => void;
  onSend: () => void;
}

/** The blind work before it is sent: the choice, the answer, the think-aloud and the two answers, with the bars. */
export function PreviewStep({ preview, busy, error, onBack, onEdit, onSend }: PreviewProps) {
  return (
    <Screen
      back={{ onBack }}
      wide
      bottom={
        <>
          <ErrorLine error={error} />
          <p className="text-footnote mb-3 text-center text-label-2">You cannot change it after you send it.</p>
          <BigButton onClick={onSend} loading={busy} className="w-full">
            Send
          </BigButton>
        </>
      }
    >
      <div className="mx-auto w-full max-w-[880px]" data-tour="blind-preview">
        <Title sub="Bars cover what we removed.">This is what the company will read</Title>
        <BlindCompare original={preview.original} blind={preview.work} hiddenCount={preview.hiddenCount} labels={["What you wrote", "What the company reads"]} initialSide="blind" />
        {preview.transcript ? (
          <section className="mt-8">
            <h2 className="mb-3 text-[20px] leading-[28px] font-semibold text-label">What you said while working</h2>
            <BlindCompare original={preview.originalTranscript} blind={preview.transcript} hiddenCount={preview.transcriptHidden} labels={["What you said", "What the company reads"]} initialSide="blind" />
          </section>
        ) : null}
        {preview.explain.length ? (
          <ol className="mt-8 flex flex-col gap-4">
            {preview.explain.map((e) => (
              <li key={e.question} className="rounded-card bg-surface p-5">
                <p className="text-footnote text-pretty text-label-2">{e.question}</p>
                <BlindText text={e.answer} className="text-body mt-1 text-label" />
              </li>
            ))}
          </ol>
        ) : null}
        <div className="mt-8 flex flex-col gap-2 rounded-card bg-surface px-5 py-4 min-[640px]:flex-row min-[640px]:items-center min-[640px]:gap-4">
          <p className="text-body min-w-0 flex-1 text-pretty text-label">Something still shows who you are? Go back and remove it.</p>
          <button type="button" onClick={onEdit} className="press text-body min-h-11 self-start font-medium text-label underline decoration-label-3 underline-offset-4 min-[640px]:self-center">
            Go back
          </button>
        </div>
      </div>
    </Screen>
  );
}

/** After Send: who scores it, the recording to replay on this device, and the way to the work. */
export function DoneStep({ company, proofId, replay }: { company: string; proofId: string; replay: Replay | null }) {
  return (
    <Screen
      bottom={
        <div className="flex flex-col gap-2">
          <BigButton href={`/my-work/${proofId}`} className="w-full">
            See my work
          </BigButton>
          <BigButton href="/seeker" variant="secondary" className="w-full">
            More challenges
          </BigButton>
        </div>
      }
      tall
    >
      <div className="mt-6 flex flex-col items-start">
        <CircleCheck aria-hidden className="size-12 text-accent" strokeWidth={1.5} />
        <h1 className="mt-6 font-serif text-[40px] leading-[44px] text-balance text-label">Done. A person at {company} will score it.</h1>
        <p className="text-body mt-3 text-pretty text-label-2">You will see the score and the reason in My work.</p>
      </div>
      {replay ? <LocalReplay replay={replay} className="mt-8" /> : null}
    </Screen>
  );
}
