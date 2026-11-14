"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState, type ReactNode } from "react";
import { AnswerQuote } from "@/components/answer-quote";
import { BlindProofFull } from "@/components/blind-proof";
import { StepSlide } from "@/components/step-slide";
import { TaskMaterial } from "@/components/task-material";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Field, TextArea } from "@/components/ui/field";
import { Group, Row } from "@/components/ui/group";
import { Screen, StepTitle } from "@/components/ui/screen";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { StepProgress } from "@/components/ui/step-progress";
import { Switch } from "@/components/ui/switch";
import { TimerChip } from "@/components/ui/timer-chip";
import { api, errorText } from "@/lib/client/api";
import { clearDraft, getSavedIdentity, getTalentId, loadDraft, saveDraft, saveIdentity } from "@/lib/client/local";
import { backInFlow, useFlowHistory } from "@/lib/client/use-flow-history";
import { useResource } from "@/lib/client/use-resource";
import type { BlindProof } from "@/lib/domain/types";
import { LIMITS } from "@/lib/http/limits";

type Step = "work" | "q0" | "q1" | "identity" | "result";
const order: Step[] = ["work", "q0", "q1", "identity", "result"];

const nextSteps = [
  "A person at the company reads it without your name.",
  "You get a decision with written feedback.",
  "If they want to meet, you choose. Only then do they see your name.",
];

export function WorkFlow({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [step, setStep] = useState<Step>("work");
  const [direction, setDirection] = useState<1 | -1>(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [answer, setAnswer] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [explain, setExplain] = useState<string[]>(["", ""]);
  const [startedAt, setStartedAt] = useState(0);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [share, setShare] = useState(true);
  const [proof, setProof] = useState<BlindProof | null>(null);
  const [restored, setRestored] = useState(false);

  // Restore a saved draft and identity once the task has loaded in the browser.
  function restoreFromDevice() {
    const draft = loadDraft(id);
    if (draft) {
      setAnswer(draft.answer);
      setExplain([draft.explain[0] ?? "", draft.explain[1] ?? ""]);
      setStartedAt(draft.startedAt);
    } else {
      setStartedAt(Date.now());
    }
    const saved = getSavedIdentity();
    setName(saved.name);
    setContact(saved.contact);
    setRestored(true);
  }

  const restoredRef = useRef(false);
  const { data: challenge, error: loadError, loading, retry } = useResource(async () => {
    const loaded = await api.challenge(id);
    if (!restoredRef.current) {
      restoredRef.current = true;
      restoreFromDevice();
    }
    return loaded;
  }, [id]);

  // Autosave the draft while the person works, and once more when the page goes away,
  // so a reload right after typing keeps the last words too.
  useEffect(() => {
    if (!restored || step === "result") return;
    const save = () => saveDraft(id, { answer, explain, startedAt });
    const t = window.setTimeout(save, 300);
    window.addEventListener("pagehide", save);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("pagehide", save);
    };
  }, [id, answer, explain, startedAt, restored, step]);

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

  // The browser's back and forward move between steps. A sent proof cannot be reopened for editing.
  useFlowHistory(step, (popped) => {
    const next = popped as Step;
    setConfirmOpen(false);
    if (proof && next !== "result") return router.replace("/passport");
    const ready = next === "work" || (next === "q0" && questions.length > 0) || (next === "q1" && questions.length > 1) || (next === "identity" && questions.length > 0);
    if (order.includes(next) && ready) go(next);
  });

  if (!challenge) {
    return (
      <Screen back={{ href: `/challenges/${id}` }}>
        {loading ? (
          <div aria-busy className="mt-2">
            <Skeleton className="h-7 w-64" />
            <div className="mt-6 h-48 rounded-inner bg-surface" />
          </div>
        ) : (
          <ErrorState error={loadError} what="this task" onRetry={retry} away={{ href: "/challenges", label: "See open challenges" }} />
        )}
      </Screen>
    );
  }

  const finishWork = () =>
    run(async () => {
      const res = await api.followups(challenge.id, answer.trim());
      setQuestions(res.questions.slice(0, 2));
      go(res.questions.length ? "q0" : "identity");
    });

  const submit = () =>
    run(async () => {
      saveIdentity(name.trim(), contact.trim());
      const res = await api.submit({
        challengeId: challenge.id,
        talent: { id: getTalentId(), name: name.trim(), contact: contact.trim() },
        answer: answer.trim(),
        explain: questions.map((question, i) => ({ question, answer: explain[i]?.trim() ?? "" })),
        shareWithSimilar: share,
      });
      clearDraft(challenge.id);
      setConfirmOpen(false);
      setProof(res.proof);
      go("result");
    });

  const setExplainAt = (i: number, value: string) => setExplain((prev) => prev.map((v, j) => (j === i ? value : v)));
  const index = order.indexOf(step);
  const errorLine = error ? (
    <p role="alert" className="text-footnote mb-3 text-center text-label-2">
      {error}
    </p>
  ) : null;

  let content: ReactNode = null;
  let bottom: ReactNode = null;

  if (step === "work") {
    content = (
      <>
        <StepTitle>{challenge.title}</StepTitle>
        <TaskMaterial challenge={challenge} />
        <div className="mt-5">
          <TextArea label="Your answer" hideLabel value={answer} onChange={setAnswer} placeholder="Write your answer" minRows={8} maxLength={LIMITS.answer} />
          <p className="text-footnote mt-2 px-4 text-label-2">
            {challenge.aiAllowed ? "AI allowed. Use it the way you would at work. " : ""}Your draft saves on this device.
          </p>
        </div>
      </>
    );
    bottom = (
      <>
        {errorLine}
        <Button onClick={finishWork} disabled={!answer.trim()} loading={busy}>
          I&apos;m done
        </Button>
      </>
    );
  }

  if (step === "q0" || step === "q1") {
    const i = step === "q0" ? 0 : 1;
    const isLast = i === questions.length - 1;
    content = (
      <>
        <StepTitle long={(questions[i] ?? "").length > 60} sub="About your own answer. Type it, or use the microphone on your keyboard.">
          {questions[i]}
        </StepTitle>
        <AnswerQuote text={answer} />
        <TextArea
          key={step}
          label="Your explanation"
          hideLabel
          value={explain[i] ?? ""}
          onChange={(v) => setExplainAt(i, v)}
          placeholder="A few sentences is enough"
          maxLength={LIMITS.explain}
          autoFocus
        />
      </>
    );
    bottom = (
      <Button onClick={() => go(isLast ? "identity" : "q1")} disabled={!explain[i]?.trim()}>
        Continue
      </Button>
    );
  }

  if (step === "identity") {
    content = (
      <>
        <StepTitle sub="The reviewer does not see this. It is shown only if they pick you and you accept.">
          Your name and contact
        </StepTitle>
        <div className="flex flex-col gap-4">
          <Field label="Name" value={name} onChange={setName} placeholder="Your name" autoComplete="name" maxLength={LIMITS.name} />
          <Field label="Email or phone" type="email" value={contact} onChange={setContact} placeholder="you@example.com" autoComplete="email" maxLength={LIMITS.contact} />
        </div>
        <Group className="mt-8" footer="A person there decides. Your name stays hidden the same way.">
          <Row
            title="Let other companies with the same skills see this proof if this one passes"
            value={<Switch checked={share} onChange={setShare} label="Share with companies that need the same skills" />}
          />
        </Group>
      </>
    );
    bottom = (
      <Button onClick={() => setConfirmOpen(true)} disabled={!name.trim() || !contact.trim()}>
        Review and submit
      </Button>
    );
  }

  if (step === "result" && proof) {
    content = (
      <>
        <h1 className="text-large-title font-bold text-balance">Your proof is in.</h1>
        <Section label="What happens next">
          <Group className="[--row-inset:48px]">
            {nextSteps.map((text, i) => (
              <Row
                key={i}
                leading={<span className="tnum text-headline w-5 font-semibold text-label">{i + 1}</span>}
                title={text}
              />
            ))}
          </Group>
        </Section>
        <Section label="This is what the company sees">
          <BlindProofFull proof={proof} reveal />
        </Section>
      </>
    );
    bottom = <Button href="/passport">See my proofs</Button>;
  }

  const back =
    step === "result"
      ? undefined
      : step === "work"
        ? { href: `/challenges/${challenge.id}` }
        : { onBack: () => backInFlow(() => go(order[index - 1])) };

  return (
    <>
      <Screen
        back={back}
        center={step === "result" ? null : <StepProgress total={4} current={index} />}
        right={step === "work" && startedAt > 0 ? <TimerChip minutes={challenge.minutes} startedAt={startedAt} /> : null}
        bottom={bottom}
      >
        <StepSlide stepKey={step} direction={direction}>
          {content}
        </StepSlide>
      </Screen>

      <Sheet open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Submit your proof">
        <ul className="mb-6 flex flex-col gap-3">
          {["Your answer", `${questions.length} explanations`, "Name and contact, hidden from the reviewer"].map((item) => (
            <li key={item} className="text-body flex items-center gap-3">
              <Check aria-hidden className="size-5 text-label-2" strokeWidth={2.2} />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-footnote mb-4 text-label-2">You cannot edit it after you submit.</p>
        {errorLine}
        <Button onClick={submit} loading={busy}>
          Submit
        </Button>
      </Sheet>
    </>
  );
}
