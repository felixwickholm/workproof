"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { joinedCode } from "@/components/table/table-copy";
import { StepSlide } from "@/components/step-slide";
import { Button } from "@/components/ui/button";
import { TimerChip } from "@/components/ui/timer-chip";
import { api, errorText } from "@/lib/client/api";
import { getTalentId } from "@/lib/client/local";
import { backInFlow, useFlowHistory } from "@/lib/client/use-flow-history";
import type { OwnProof } from "@/lib/domain/types";
import { FindingStep } from "./finding-step";
import { JobStep } from "./job-step";
import { PrimaryAction } from "./primary-action";
import { Reveal } from "./reveal";
import { TableInviteCard } from "./table-invite";
import { practiceLine } from "./try-copy";
import { TryFrame, type Back } from "./try-frame";
import { clearTry, parseSavedTry, readSavedTry, saveTry, type Answer, type Taster } from "./try-state";
import { useTableInvite } from "./use-table-invite";
import { ExplainStep, NameStep, TaskStep } from "./work-steps";

type Step = "job" | "finding" | "task" | "explain" | "name" | "result";
/** The steps a person moves through; "finding" is a wait inside the first one. */
const ORDER: Step[] = ["job", "task", "explain", "name", "result"];

/** Long enough to read the line, short enough to feel quick. */
const FINDING_AT_LEAST_MS = 900;
const FALLBACK_QUESTION = "Why did you choose this approach?";

/** Whether this phone shares a table's demo: "inactive" when it came with a code the server does not know. */
type TableLink = "none" | "joined" | "inactive";

const empty: Answer = { text: "", spoken: false };
const noop = () => () => {};
const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

/**
 * The 2-minute practice task, one question per screen: dream job, the task, one follow-up,
 * a first name, then the reveal of what a company would read. Nothing goes to a company. At a
 * table, the proof shows on the big screen as a label and a task, and the table may invite.
 */
export function TryFlow() {
  const [step, setStep] = useState<Step>("job");
  const [direction, setDirection] = useState<1 | -1>(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [job, setJob] = useState("");
  const [challenge, setChallenge] = useState<Taster | null>(null);
  /** The job the current task was made for, so going back and forward keeps the same task. */
  const [taskFor, setTaskFor] = useState("");
  const [startedAt, setStartedAt] = useState(0);
  const [answer, setAnswer] = useState<Answer>(empty);
  const [question, setQuestion] = useState("");
  const [explain, setExplain] = useState<Answer>(empty);
  /** Only in this page's memory: used once to hide the name, and to prefill an acceptance. */
  const [name, setName] = useState("");
  const [proof, setProof] = useState<OwnProof | null>(null);
  const [sentName, setSentName] = useState("");
  const [table, setTable] = useState<TableLink>("none");

  const tableInvite = useTableInvite(table === "joined" && step === "result" && proof ? proof.proofId : null);

  // A phone that came from the table's code checks it really shares the table's sandbox.
  useEffect(() => {
    const code = joinedCode(window.location.search);
    if (!code) return;
    api
      .demoSession()
      .then((session) => setTable(session.code === code ? "joined" : "inactive"))
      .catch(() => setTable("inactive"));
  }, []);

  // A refresh mid-task comes back to the same question with the same words. The saved text is read
  // on the first render in the browser (the server has none) and copied into the flow once, before
  // anything new is saved over it.
  const inBrowser = useSyncExternalStore(noop, () => true, () => false);
  const [restored, setRestored] = useState(false);
  if (inBrowser && !restored) {
    setRestored(true);
    const saved = parseSavedTry(readSavedTry());
    if (saved) {
      setJob(saved.job);
      setChallenge(saved.challenge);
      setTaskFor(saved.job);
      setStartedAt(saved.startedAt);
      setAnswer(saved.answer);
      setQuestion(saved.question);
      setExplain(saved.explain);
      setStep(saved.step);
    }
  }

  useEffect(() => {
    if (!challenge || (step !== "task" && step !== "explain" && step !== "name")) return;
    const save = () => saveTry({ step, job: taskFor, challenge, startedAt, answer, question, explain });
    const t = window.setTimeout(save, 300);
    window.addEventListener("pagehide", save);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("pagehide", save);
    };
  }, [step, taskFor, challenge, startedAt, answer, question, explain]);

  /**
   * The input a Continue has just left. From the press on, late keys and autofill on the old
   * screen are ignored, so what was sent is what the next screen quotes.
   */
  const frozen = useRef<Step | null>(null);
  const freeze = (left: Step) => {
    frozen.current = left;
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  };
  const editAnswer = (next: Answer) => {
    if (frozen.current !== "task") setAnswer(next);
  };
  const editExplain = (next: Answer) => {
    if (frozen.current !== "explain") setExplain(next);
  };

  const go = (next: Step) => {
    if (frozen.current === next) frozen.current = null;
    setDirection(ORDER.indexOf(next) >= ORDER.indexOf(step) ? 1 : -1);
    setError(null);
    setStep(next);
    window.scrollTo({ top: 0 });
  };

  /** One request at a time: a double tap or a repeated Enter never sends twice. */
  const inFlight = useRef(false);
  async function run(action: () => Promise<void>, onError?: () => void) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      onError?.();
      setError(errorText(e));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  const start = (picked?: string) => {
    const wanted = (picked ?? job).trim();
    if (wanted.length < 2) return;
    if (challenge && wanted === taskFor) return go("task");
    return run(
      async () => {
        setStep("finding");
        const [next] = await Promise.all([api.taster(wanted), wait(FINDING_AT_LEAST_MS)]);
        setChallenge(next);
        setTaskFor(wanted);
        setStartedAt(Date.now());
        setAnswer(empty);
        setExplain(empty);
        go("task");
      },
      () => setStep("job"),
    );
  };

  // The follow-up never blocks the flow: if it cannot be written, a plain question stands in.
  const toExplain = () => {
    if (!challenge || !answer.text.trim()) return;
    freeze("task");
    const written = answer.text.trim();
    return run(
      async () => {
        const questions = await api
          .followups(challenge.id, written)
          .then((r) => r.questions)
          .catch(() => []);
        setQuestion(questions[0] ?? FALLBACK_QUESTION);
        go("explain");
      },
      () => {
        frozen.current = null;
      },
    );
  };

  const toName = () => {
    if (!explain.text.trim()) return;
    freeze("explain");
    go("name");
  };

  const send = (withName: boolean) =>
    run(async () => {
      if (!challenge) return;
      const first = withName ? name.trim() : "";
      const res = await api.submit({
        challengeId: challenge.id,
        talent: { id: getTalentId(), name: first, contact: "" },
        answer: answer.text.trim(),
        explain: [{ question, answer: explain.text.trim(), ...(explain.spoken ? { spoken: true } : {}) }],
        ...(answer.spoken ? { spoken: true } : {}),
        shareWithSimilar: false,
      });
      clearTry();
      setSentName(first);
      setProof(res.proof);
      go("result");
    });

  /** A fresh start, for the next visitor or the next job. */
  const restart = () => {
    clearTry();
    frozen.current = null;
    setProof(null);
    setChallenge(null);
    setTaskFor("");
    setJob("");
    setAnswer(empty);
    setExplain(empty);
    setSentName("");
    go("job");
  };

  // The browser's back and forward move between steps. A sent proof starts over instead of reopening.
  useFlowHistory(step === "finding" ? "job" : step, (popped) => {
    const next = popped as Step;
    if (proof && next !== "result") return restart();
    const ready = next === "job" || (next === "task" && challenge) || ((next === "explain" || next === "name") && question);
    if (ORDER.includes(next) && ready) go(next);
  });

  const index = ORDER.indexOf(step === "finding" ? "job" : step);
  const back: Back | undefined =
    step === "job" ? { href: "/" } : step === "result" || step === "finding" ? undefined : { onBack: () => backInFlow(() => go(ORDER[index - 1])) };

  const errorLine = error ? (
    <p role="alert" className="text-footnote mb-3 text-center text-label-2">
      {error}
    </p>
  ) : null;

  let content: ReactNode = null;
  let action: ReactNode = null;

  if (step === "job") {
    content = <JobStep job={job} onJob={setJob} onStart={start} tableInactive={table === "inactive"} />;
    action = (
      <>
        {errorLine}
        <PrimaryAction onClick={() => start()} rule={job.trim().length < 2 ? "Type a job to continue." : null} busy={busy}>
          Find my task
        </PrimaryAction>
        {/* In the pinned bar, so the promise is in view before anything is typed. */}
        <p className="text-caption text-center text-pretty text-label-2">No sign-up. 2 minutes. {practiceLine(table === "joined")}</p>
      </>
    );
  }

  if (step === "finding") content = <FindingStep job={job} />;

  if (step === "task" && challenge) {
    content = <TaskStep challenge={challenge} job={taskFor} generic={Boolean(challenge.note)} answer={answer} onAnswer={editAnswer} />;
    action = (
      <>
        {errorLine}
        <PrimaryAction onClick={() => void toExplain()} rule={answer.text.trim() ? null : "Write your answer to continue."} busy={busy}>
          Continue
        </PrimaryAction>
      </>
    );
  }

  if (step === "explain") {
    content = <ExplainStep question={question} answer={answer.text} explain={explain} onExplain={editExplain} />;
    action = (
      <PrimaryAction onClick={toName} rule={explain.text.trim() ? null : "Answer the question to continue."}>
        Continue
      </PrimaryAction>
    );
  }

  if (step === "name") {
    const named = name.trim().length > 0;
    content = <NameStep name={name} onName={setName} onSend={() => send(true)} />;
    action = (
      <>
        {errorLine}
        <div className="flex gap-2 pb-2">
          {named ? (
            <Button variant="secondary" onClick={() => send(false)} disabled={busy} className="h-[52px]! w-auto! px-5">
              Skip
            </Button>
          ) : null}
          <Button onClick={() => send(true)} loading={busy} className="h-[52px]! flex-1">
            {named ? "Send" : "Skip and send"}
          </Button>
        </div>
      </>
    );
  }

  if (step === "result" && proof) {
    content = (
      <Reveal
        proof={proof}
        written={{ answer: answer.text.trim(), explain: explain.text.trim() }}
        onTable={table === "joined"}
        nameGiven={sentName.length > 0}
        onAnotherJob={restart}
      />
    );
    if (tableInvite.invite) {
      action = <TableInviteCard invite={tableInvite.invite} firstName={sentName} onAccept={tableInvite.accept} onDecline={tableInvite.decline} />;
    }
  }

  return (
    <TryFrame
      back={back}
      progress={step === "result" ? undefined : { current: index + 1, total: ORDER.length }}
      right={step === "task" && challenge ? <TimerChip minutes={challenge.minutes} startedAt={startedAt} /> : null}
      action={action}
    >
      <StepSlide stepKey={step} direction={direction} className="flex flex-1 flex-col">
        {content}
      </StepSlide>
    </TryFrame>
  );
}
