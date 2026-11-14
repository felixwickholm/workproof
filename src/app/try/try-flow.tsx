"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { AnswerQuote } from "@/components/answer-quote";
import { BlindProofFull } from "@/components/blind-proof";
import { StepSlide } from "@/components/step-slide";
import { TaskMaterial } from "@/components/task-material";
import { Button } from "@/components/ui/button";
import { cx } from "@/components/ui/cx";
import { Field, TextArea } from "@/components/ui/field";
import { Screen, StepTitle, TwoPane } from "@/components/ui/screen";
import { StepProgress } from "@/components/ui/step-progress";
import { TimerChip } from "@/components/ui/timer-chip";
import { api, errorText } from "@/lib/client/api";
import { getSavedIdentity, getTalentId, saveIdentity } from "@/lib/client/local";
import { backInFlow, useFlowHistory } from "@/lib/client/use-flow-history";
import type { Challenge, OwnProof } from "@/lib/domain/types";
import { LIMITS } from "@/lib/http/limits";

const suggestions = ["AI engineer", "Backend developer", "Data scientist", "Product manager", "UX designer", "Robotics engineer"];

type Step = "job" | "task" | "explain" | "name" | "result";
const order: Step[] = ["job", "task", "explain", "name", "result"];

export function TryFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("job");
  const [direction, setDirection] = useState<1 | -1>(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dreamJob, setDreamJob] = useState("");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  /** The job the current task was made for, so going back and forward keeps the same task. */
  const [taskFor, setTaskFor] = useState("");
  const [startedAt, setStartedAt] = useState(0);
  const [answer, setAnswer] = useState("");
  const [question, setQuestion] = useState("");
  const [explain, setExplain] = useState("");
  const [name, setName] = useState("");
  const [proof, setProof] = useState<OwnProof | null>(null);

  const go = (next: Step) => {
    setDirection(order.indexOf(next) > order.indexOf(step) ? 1 : -1);
    setError(null);
    setStep(next);
    window.scrollTo({ top: 0 });
  };

  /** One request at a time: a double tap or a repeated Enter never sends twice. */
  const inFlight = useRef(false);
  async function run(action: () => Promise<void>) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(errorText(e));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  const startTask = () =>
    run(async () => {
      const job = dreamJob.trim();
      if (job.length < 2) return;
      if (!challenge || job !== taskFor) {
        const next = await api.taster(job);
        setChallenge(next);
        setTaskFor(job);
        setStartedAt(Date.now());
        setAnswer("");
      }
      go("task");
    });

  const submitAnswer = () =>
    run(async () => {
      if (!challenge) return;
      const { questions } = await api.followups(challenge.id, answer.trim());
      setQuestion(questions[0] ?? "Why did you choose this approach?");
      setName((current) => current || getSavedIdentity().name);
      go("explain");
    });

  const submitProof = () =>
    run(async () => {
      if (!challenge) return;
      const first = name.trim();
      if (first) saveIdentity(first);
      const res = await api.submit({
        challengeId: challenge.id,
        talent: { id: getTalentId(), name: first, contact: "" },
        answer: answer.trim(),
        explain: [{ question, answer: explain.trim() }],
        shareWithSimilar: false,
      });
      setProof(res.proof);
      go("result");
    });

  // The browser's back and forward move between steps. A sent proof cannot be reopened for editing.
  useFlowHistory(step, (popped) => {
    const next = popped as Step;
    if (proof && next !== "result") return router.replace("/passport");
    const ready = next === "job" || (next === "task" && challenge) || ((next === "explain" || next === "name") && question);
    if (order.includes(next) && ready) go(next);
  });

  const index = order.indexOf(step);
  const back =
    step === "job"
      ? { href: "/" }
      : step === "result"
        ? undefined
        : { onBack: () => backInFlow(() => go(order[index - 1])) };

  const errorLine = error ? (
    <p role="alert" className="text-footnote mb-3 text-center text-label-2">
      {error}
    </p>
  ) : null;

  let content: ReactNode = null;
  let bottom: ReactNode = null;

  if (step === "job") {
    content = (
      <>
        <StepTitle sub="You get a short task from that job. It takes about 2 minutes.">What&apos;s your dream job?</StepTitle>
        <Field
          label="Dream job"
          hideLabel
          value={dreamJob}
          onChange={setDreamJob}
          placeholder="For example, AI engineer"
          maxLength={LIMITS.dreamJob}
          autoFocus
          onEnter={startTask}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setDreamJob(s)}
              aria-pressed={dreamJob === s}
              className={cx(
                "press text-subhead h-11 rounded-full px-4 font-medium transition-colors duration-150",
                dreamJob === s ? "bg-raised text-label shadow-[inset_0_0_0_1px_var(--color-white)]" : "bg-surface text-label",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </>
    );
    bottom = (
      <>
        {errorLine}
        <Button onClick={startTask} disabled={dreamJob.trim().length < 2} loading={busy}>
          {busy ? "Making your task" : "Continue"}
        </Button>
      </>
    );
  }

  if (step === "task" && challenge) {
    content = (
      <>
        <TwoPane
          task={
            <>
              <StepTitle>{challenge.title}</StepTitle>
              <TaskMaterial challenge={challenge} />
            </>
          }
          answer={
            <>
              <TextArea label="Your answer" value={answer} onChange={setAnswer} placeholder="Write your answer" minRows={5} maxLength={LIMITS.answer} />
              {challenge.aiAllowed ? (
                <p className="text-footnote mt-2 px-4 text-label-2">AI allowed. Use it the way you would at work.</p>
              ) : null}
            </>
          }
        />
      </>
    );
    bottom = (
      <>
        {errorLine}
        <Button onClick={submitAnswer} disabled={!answer.trim()} loading={busy}>
          Submit
        </Button>
      </>
    );
  }

  if (step === "explain") {
    content = (
      <>
        <StepTitle long={question.length > 60}>{question}</StepTitle>
        <AnswerQuote text={answer} />
        <TextArea label="Your explanation" hideLabel value={explain} onChange={setExplain} placeholder="A few sentences is enough" maxLength={LIMITS.explain} autoFocus />
      </>
    );
    bottom = (
      <>
        {errorLine}
        <Button onClick={() => go("name")} disabled={!explain.trim()}>
          Continue
        </Button>
      </>
    );
  }

  if (step === "name") {
    content = (
      <>
        <StepTitle sub="So the company can greet you, if you both say yes. You can skip this.">
          What&apos;s your first name?
        </StepTitle>
        <Field label="First name" hideLabel value={name} onChange={setName} placeholder="First name" autoComplete="given-name" maxLength={LIMITS.name} autoFocus onEnter={submitProof} />
      </>
    );
    bottom = (
      <>
        {errorLine}
        <Button onClick={submitProof} loading={busy}>
          {name.trim() ? "Show my proof" : "Skip and show my proof"}
        </Button>
      </>
    );
  }

  if (step === "result" && proof) {
    content = (
      <>
        <p className="text-subhead inline-flex h-7 items-center rounded-full bg-surface px-3 font-medium text-label-2">
          Practice proof. Not sent to any company.
        </p>
        <h1 className="text-large-title mt-3 font-bold text-balance">This is what a company would see.</h1>
        <p className="text-body mt-2 mb-6 text-label-2 text-pretty">
          Next, pick a real task. A person at that company reads your work and decides who to meet.
        </p>
        <BlindProofFull proof={proof} reveal />
      </>
    );
    bottom = (
      <div className="flex flex-col-reverse gap-2 min-[360px]:flex-row min-[360px]:gap-3">
        <Button href="/passport" variant="secondary" className="min-[360px]:w-auto! min-[360px]:px-6">
          My proofs
        </Button>
        <Button href="/challenges" className="min-[360px]:flex-1">
          See real tasks
        </Button>
      </div>
    );
  }

  return (
    <Screen
      back={back}
      center={step === "result" ? null : <StepProgress total={4} current={index} />}
      right={step === "task" && challenge ? <TimerChip minutes={challenge.minutes} startedAt={startedAt} /> : null}
      bottom={bottom}
      wide={step === "task"}
    >
      <StepSlide stepKey={step} direction={direction}>
        {content}
      </StepSlide>
    </Screen>
  );
}
