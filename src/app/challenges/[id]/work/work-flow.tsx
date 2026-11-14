"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState, type ReactNode } from "react";
import { BlindCompare, TaskMaterialView, taskMeta } from "@/components/proof";
import { AiAllowedLine } from "@/components/seeker/ai-line";
import { AnswerArea } from "@/components/seeker/answer-area";
import { answerReady, defaultMode, type AnswerMode, type AnswerValue } from "@/components/seeker/answer-mode";
import { usePersonaName } from "@/components/seeker/identity-line";
import { FlowProgress } from "@/components/seeker/flow-progress";
import { BigButton, GatedAction } from "@/components/seeker/gated-action";
import { PictureCheck } from "@/components/seeker/picture-slot";
import { StepSlide } from "@/components/step-slide";
import { cx } from "@/components/ui/cx";
import { ErrorState } from "@/components/ui/error-state";
import { Field, TextArea } from "@/components/ui/field";
import { Screen, StepTitle, TwoPane } from "@/components/ui/screen";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { TimerChip } from "@/components/ui/timer-chip";
import { SpokenBadge, VoiceButton } from "@/components/voice";
import { api, ApiError, errorText } from "@/lib/client/api";
import { clearDraft, getIdentity, getSavedIdentity, getTalentId, loadDraft, saveDraft, saveIdentity } from "@/lib/client/local";
import { backInFlow, useFlowHistory } from "@/lib/client/use-flow-history";
import { useResource } from "@/lib/client/use-resource";
import type { Challenge, OwnProof } from "@/lib/domain/types";
import { LIMITS } from "@/lib/http/limits";

type Step = "work" | "explain" | "send" | "sent";
const order: Step[] = ["work", "explain", "send", "sent"];

const SHARE_LABEL = "Let other employers with matching tasks see this proof if this one says not now or does not answer in 48 hours";

/** Plain questions about the person's own choices, used only when the question writer returns fewer than two. */
const FALLBACK_QUESTIONS = ["Why did you choose this approach?", "What would you check first if you had more time?"];

const NEXT_STEPS = [
  "A person at the company reads it without your name.",
  "You get a written answer, also when it is a no.",
  "If they want to meet, you decide. Only then do they see your name.",
];

/** The demo person's contact: invented, on the reserved example domain. */
function personaContact(fullName: string) {
  return `${fullName.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "")}@example.org`;
}

interface Explain {
  answer: string;
  spoken: boolean;
}

/** Do the task, explain two choices, send, then see what the company reads. One step per screen. */
export function WorkFlow({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const persona = usePersonaName();
  const [step, setStep] = useState<Step>("work");
  const [direction, setDirection] = useState<1 | -1>(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<AnswerMode>("write");
  const [value, setValue] = useState<AnswerValue>({ answer: "", spoken: false, picture: null, caption: "" });
  const [questions, setQuestions] = useState<string[]>([]);
  const [explain, setExplain] = useState<Explain[]>([
    { answer: "", spoken: false },
    { answer: "", spoken: false },
  ]);
  const [startedAt, setStartedAt] = useState(0);
  const [sendAs, setSendAs] = useState<"persona" | "me">("persona");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [share, setShare] = useState(false);
  /** The person checked the picture shows the work only. Cleared whenever the picture changes. */
  const [pictureChecked, setPictureChecked] = useState(false);
  const [sent, setSent] = useState<{ proof: OwnProof; original: string } | null>(null);
  const [restored, setRestored] = useState(false);

  // Restore a saved draft and the visitor's own details once the task has loaded in the browser.
  const restoredRef = useRef(false);
  const { data: challenge, error: loadError, loading, retry } = useResource(async () => {
    const loaded = await api.challenge(id);
    if (!restoredRef.current) {
      restoredRef.current = true;
      const draft = loadDraft(id);
      setMode(defaultMode(loaded.proofKind));
      if (draft) {
        setValue((v) => ({ ...v, answer: draft.answer }));
        setExplain([0, 1].map((i) => ({ answer: draft.explain[i] ?? "", spoken: false })));
      }
      setStartedAt(draft?.startedAt ?? Date.now());
      const saved = getSavedIdentity();
      setName(saved.name);
      setContact(saved.contact);
      setSendAs(getIdentity());
      setRestored(true);
    }
    return loaded;
  }, [id]);

  // Autosave the words while the person works, and once more when the page goes away.
  const answerText = value.answer;
  const explainKey = JSON.stringify(explain.map((e) => e.answer));
  useEffect(() => {
    if (!restored || step === "sent") return;
    const save = () => saveDraft(id, { answer: answerText, explain: JSON.parse(explainKey) as string[], startedAt });
    const t = window.setTimeout(save, 300);
    window.addEventListener("pagehide", save);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("pagehide", save);
    };
  }, [id, answerText, explainKey, startedAt, restored, step]);

  const go = (next: Step) => {
    setDirection(order.indexOf(next) > order.indexOf(step) ? 1 : -1);
    setError(null);
    setStep(next);
    window.scrollTo({ top: 0 });
  };

  /** One request at a time: a double tap never sends twice. */
  const inFlight = useRef(false);
  async function run(action: () => Promise<void>) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      // A refusal the server explains (a full task) is said in its own words.
      setError(e instanceof ApiError && e.status === 409 ? e.message : errorText(e));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  // The browser's back and forward move between steps. A sent proof cannot be reopened for editing.
  useFlowHistory(step, (popped) => {
    const next = popped as Step;
    if (sent && next !== "sent") return router.replace(`/passport/${sent.proof.proofId}`);
    if (next === "work" || ((next === "explain" || next === "send") && questions.length > 0)) go(next);
  });

  if (!challenge) {
    return (
      <Screen back={{ href: `/challenges/${id}` }} wide>
        {loading ? (
          <div aria-busy className="mt-2">
            <Skeleton className="h-7 w-64" />
            <div className="mt-6 h-48 rounded-inner bg-surface" />
          </div>
        ) : (
          <ErrorState error={loadError} what="this task" onRetry={retry} away={{ href: "/challenges", label: "See open tasks" }} />
        )}
      </Screen>
    );
  }

  /** The words the blind layer and the follow-up questions read: the notes, or the picture's description. */
  const writtenAnswer = () => (value.answer.trim() || (mode === "picture" ? value.caption.trim() : "")).trim();

  const finishWork = () =>
    run(async () => {
      const known = sendAs === "me" && name.trim() ? { name: name.trim(), contact: contact.trim() } : undefined;
      const res = await api.followups(challenge.id, writtenAnswer(), known);
      // Two follow-up answers are part of every event proof; plain questions stand in if fewer come back.
      setQuestions([...res.questions, ...FALLBACK_QUESTIONS.filter((q) => !res.questions.includes(q))].slice(0, 2));
      go("explain");
    });

  const personaName = persona?.full ?? "";
  const sendName = sendAs === "persona" ? personaName : name.trim();
  const sendContact = sendAs === "persona" ? personaContact(personaName) : contact.trim();

  const submit = () =>
    run(async () => {
      const talentId = sendAs === "persona" ? (await api.demoSession()).persona.talentId : getTalentId();
      if (sendAs === "me") saveIdentity(sendName, sendContact);
      const original = writtenAnswer();
      const picture = mode === "picture" ? value.picture : null;
      const res = await api.submit({
        challengeId: challenge.id,
        talent: { id: talentId, name: sendName, contact: sendContact },
        answer: original,
        explain: questions.map((question, i) => ({
          question,
          answer: explain[i]?.answer.trim() ?? "",
          ...(explain[i]?.spoken ? { spoken: true } : {}),
        })),
        ...(picture
          ? { attachment: { kind: challenge.proofKind === "design" ? ("design" as const) : ("photo" as const), src: picture, alt: value.caption.trim(), confirmed: true as const } }
          : {}),
        ...(value.spoken && mode !== "picture" ? { spoken: true } : {}),
        shareWithSimilar: share,
      });
      clearDraft(challenge.id);
      setSent({ proof: res.proof, original });
      go("sent");
    });

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
      <TwoPane
        task={<TaskSide challenge={challenge} />}
        answer={
          <>
            <AnswerArea
              kind={challenge.proofKind}
              mode={mode}
              onMode={setMode}
              value={value}
              onChange={(patch) => {
                if ("picture" in patch) setPictureChecked(false);
                setValue((v) => ({ ...v, ...patch }));
              }}
              prompt={challenge.deliverable}
            />
            <p className="text-footnote mt-3 text-label-2">
              {challenge.aiAllowed ? "AI allowed. Use it the way you would at work. " : ""}Your words save on this device. The clock never stops you.
            </p>
          </>
        }
      />
    );
    bottom = (
      <>
        {errorLine}
        <GatedAction onClick={finishWork} locked={!answerReady(mode, value)} reason={mode === "picture" ? "Add a picture and say what it shows to continue." : "Write your answer to continue."} loading={busy}>
          I&apos;m done
        </GatedAction>
      </>
    );
  }

  if (step === "explain") {
    content = (
      <>
        <StepTitle sub="Two questions about your own choices. Write a few sentences, or say it.">Explain your choices</StepTitle>
        <div className="flex flex-col gap-8">
          {questions.map((question, i) => (
            <section key={question}>
              <h2 className="text-headline mb-3 font-semibold text-pretty text-label">{question}</h2>
              <TextArea
                label={`Answer to question ${i + 1}`}
                hideLabel
                value={explain[i]?.answer ?? ""}
                onChange={(answer) => setExplain((prev) => prev.map((e, j) => (j === i ? { answer, spoken: answer.trim() ? e.spoken : false } : e)))}
                placeholder="A few sentences is enough"
                minRows={3}
                maxLength={LIMITS.explain}
              />
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <VoiceButton
                  label="Say it instead"
                  title="Explain your choices"
                  prompt={question}
                  onUse={(answer) => setExplain((prev) => prev.map((e, j) => (j === i ? { answer, spoken: true } : e)))}
                />
                {explain[i]?.spoken ? <SpokenBadge /> : null}
              </div>
            </section>
          ))}
        </div>
      </>
    );
    bottom = (
      <GatedAction onClick={() => go("send")} locked={questions.some((_, i) => !explain[i]?.answer.trim())} reason="Answer both questions to continue.">
        Continue
      </GatedAction>
    );
  }

  const sendingPicture = mode === "picture" ? value.picture : null;

  const sendReason = !sendName || !sendContact ? "Add your name and a way to reach you to send." : "Check the picture to send.";

  if (step === "send") {
    content = (
      <>
        <StepTitle sub="Your name is shown to a company only after you accept its invitation.">Send your proof</StepTitle>
        {sendingPicture ? <PictureCheck src={sendingPicture} checked={pictureChecked} onChange={setPictureChecked} /> : null}
        {sendAs === "persona" ? (
          <div className={cx("rounded-card bg-surface p-5", sendingPicture && "mt-4")}>
            <p className="text-subhead text-label">Sending as {persona?.first ?? "Olena"}, the demo person</p>
            <p className="text-footnote mt-1 text-label-2">
              {sendName} · {sendContact}
            </p>
            <button type="button" onClick={() => setSendAs("me")} className="press text-subhead mt-2 min-h-11 font-medium text-label underline decoration-label-3 underline-offset-4">
              Send as myself
            </button>
          </div>
        ) : (
          <div className={cx("flex flex-col gap-4", sendingPicture && "mt-4")}>
            <Field label="Name" value={name} onChange={setName} placeholder="Your name" autoComplete="name" maxLength={LIMITS.name} />
            <Field label="Email or phone" type="email" value={contact} onChange={setContact} placeholder="you@example.org" autoComplete="email" maxLength={LIMITS.contact} />
            <button type="button" onClick={() => setSendAs("persona")} className="press text-subhead min-h-11 self-start font-medium text-label-2 underline decoration-label-3 underline-offset-4">
              Send as {persona?.first ?? "Olena"}, the demo person
            </button>
          </div>
        )}
        <div className="mt-6 flex items-center gap-4 rounded-card bg-surface px-5 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-subhead text-pretty text-label">{SHARE_LABEL}</p>
            <p className="text-footnote mt-1 text-label-2">They see the same blind proof. No name.</p>
          </div>
          <Switch checked={share} onChange={setShare} label={SHARE_LABEL} />
        </div>
        {challenge.aiAllowed ? <AiAllowedLine className="mt-6 rounded-card bg-surface px-5 py-4 text-subhead" /> : null}
      </>
    );
    bottom = (
      <>
        {errorLine}
        <p className="text-footnote mb-3 text-center text-label-2">You cannot edit it after you send it.</p>
        <GatedAction onClick={submit} loading={busy} locked={!sendName || !sendContact || (Boolean(sendingPicture) && !pictureChecked)} reason={sendReason}>
          Send
        </GatedAction>
      </>
    );
  }

  if (step === "sent" && sent) {
    content = (
      <>
        <StepTitle sub="A person at the company reads it without your name, and answers in writing.">This is what the company reads.</StepTitle>
        <BlindCompare original={sent.original} blind={sent.proof.work} hiddenCount={sent.proof.hiddenCount} labels={["What you wrote", "What the company reads"]} />
        <h2 className="text-headline mt-8 font-semibold text-label">What happens next</h2>
        <ol className="mt-3 flex flex-col gap-3">
          {NEXT_STEPS.map((text, i) => (
            <li key={text} className="flex gap-3">
              <span className="text-subhead tnum grid size-6 shrink-0 place-items-center rounded-full bg-fill font-medium text-label">{i + 1}</span>
              <span className="text-subhead pt-0.5 text-pretty text-label">{text}</span>
            </li>
          ))}
        </ol>
      </>
    );
    bottom = (
      <div className="flex flex-col gap-2 min-[900px]:flex-row">
        <BigButton href={`/passport/${sent.proof.proofId}`} className="w-full min-[900px]:w-auto">
          Open my passport
        </BigButton>
        <BigButton href="/challenges" variant="secondary" className="w-full min-[900px]:w-auto">
          More tasks
        </BigButton>
      </div>
    );
  }

  const back = step === "sent" ? undefined : step === "work" ? { href: `/challenges/${challenge.id}` } : { onBack: () => backInFlow(() => go(order[index - 1])) };

  return (
    <Screen
      back={back}
      center={<FlowProgress step={index + 1} total={order.length} />}
      right={step === "work" && startedAt > 0 ? <TimerChip minutes={challenge.minutes} startedAt={startedAt} /> : null}
      bottom={bottom}
      tall
      wide={step === "work"}
    >
      <StepSlide stepKey={step} direction={direction}>
        {content}
      </StepSlide>
    </Screen>
  );
}

/** The task beside the answer: on a phone it folds away under its title once read. */
function TaskSide({ challenge }: { challenge: Challenge }) {
  return (
    <details open className="group">
      <summary className="flex cursor-pointer list-none items-start gap-3 min-[900px]:pointer-events-none [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <p className="text-footnote tnum mt-2 font-medium text-label-2">{taskMeta(challenge.minutes, challenge.proofKind)}</p>
          <h1 className="text-title mt-1 font-semibold text-pretty min-[900px]:text-[30px] min-[900px]:leading-[36px]">{challenge.title}</h1>
        </div>
        <ChevronDown aria-hidden className="mt-8 size-5 shrink-0 text-label-2 transition-transform duration-200 group-open:rotate-180 min-[900px]:hidden" strokeWidth={1.8} />
      </summary>
      <div className="mt-4 flex flex-col gap-4">
        <p className="text-body whitespace-pre-wrap text-pretty text-label-2">{challenge.brief}</p>
        <div className="border-t border-separator pt-4">
          <p className="text-footnote text-label-2">You hand in</p>
          <p className="text-headline mt-1 font-semibold text-pretty text-label">{challenge.deliverable}</p>
        </div>
        {challenge.material ? <TaskMaterialView material={challenge.material} /> : null}
      </div>
    </details>
  );
}
