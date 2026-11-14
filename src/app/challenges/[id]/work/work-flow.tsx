"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FORMAT_LABEL, FormatIcon } from "@/components/seeker/task-format";
import { usePersonaName } from "@/components/seeker/identity-line";
import { WorkArea } from "@/components/seeker/work/work-area";
import { DemoCursor, DEMO_SESSION_EVENT, useDemoSession } from "@/components/think-aloud/demo-session";
import { RecorderPill } from "@/components/think-aloud/recorder-pill";
import { ThinkAloudIntro } from "@/components/think-aloud/think-aloud-intro";
import { TimeRing } from "@/components/think-aloud/time-ring";
import { canCaptureScreen, useThinkAloud } from "@/components/think-aloud/use-think-aloud";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { Skeleton } from "@/components/ui/skeleton";
import { api, ApiError, companyApi, errorText } from "@/lib/client/api";
import { clearDraft, getIdentity, getSavedIdentity, getTalentId, loadDraft, saveDraft, saveIdentity } from "@/lib/client/local";
import { backInFlow, useFlowHistory } from "@/lib/client/use-flow-history";
import { useResource } from "@/lib/client/use-resource";
import type { Challenge } from "@/lib/domain/types";
import { composeAnswer, workReady, type WorkParts } from "@/lib/think-aloud/answer";
import { fixUnits, markedText } from "@/lib/think-aloud/fix-units";
import { isLive } from "@/lib/think-aloud/machine";
import { scriptFromProof } from "@/lib/think-aloud/demo-script";
import type { DemoScript } from "@/lib/think-aloud/timeline";
import { firstWords } from "@/lib/think-aloud/timeline";
import { transcriptToSend } from "@/lib/think-aloud/transcript";
import { SessionView } from "./session-view";
import { DoneStep, PreviewStep, QuestionsStep, YouStep, type Answers, type Preview, type Sender } from "./send-steps";

type Step = "intro" | "work" | "questions" | "you" | "preview" | "done";
const ORDER: Step[] = ["intro", "work", "questions", "you", "preview", "done"];

const EMPTY: WorkParts = { main: "" };

/**
 * The challenge as a work session: one screen about what is recorded, the workspace with the recorder
 * running, two follow-up questions, who you are, what the company will read, and Send.
 * `?demo=1` (or the tour's event) plays a scripted sample session on the same screen instead.
 */
export function WorkFlow({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const search = useSearchParams();
  const router = useRouter();
  const { data, error: loadError, loading, retry } = useResource(async () => {
    const [challenge, companies] = await Promise.all([api.challenge(id), api.companies().catch(() => [])]);
    return { challenge, company: companies.filter((c) => challenge.companyIds.includes(c.id)).map((c) => c.name).join(" and ") || "the company" };
  }, [id]);
  const [demo, setDemo] = useState(search.get("demo") === "1");
  useEffect(() => {
    const onDemo = () => setDemo(true);
    window.addEventListener(DEMO_SESSION_EVENT, onDemo);
    return () => window.removeEventListener(DEMO_SESSION_EVENT, onDemo);
  }, []);

  if (!data) {
    return (
      <Screen back={{ href: "/seeker" }}>
        {loading ? (
          <div aria-busy className="mt-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="mt-8 h-14 w-full" />
            <Skeleton className="mt-4 h-6 w-5/6" />
            <Skeleton className="mt-2 h-6 w-4/6" />
          </div>
        ) : (
          <ErrorState error={loadError} what="this challenge" onRetry={retry} away={{ href: "/seeker", label: "See the challenges" }} />
        )}
      </Screen>
    );
  }
  return demo ? <DemoRun challenge={data.challenge} onExit={() => { setDemo(false); router.replace(`/challenges/${id}/work`); }} /> : <LiveRun challenge={data.challenge} company={data.company} />;
}

/** The person's own session. */
function LiveRun({ challenge, company }: { challenge: Challenge; company: string }) {
  const router = useRouter();
  const persona = usePersonaName();
  const think = useThinkAloud();
  const [step, setStep] = useState<Step>("intro");
  const [parts, setParts] = useState<WorkParts>(() => ({ ...EMPTY, main: loadDraft(challenge.id)?.answer ?? "" }));
  const [mark, setMark] = useState<number | null>(null);
  const [picture, setPicture] = useState<string | null>(null);
  const [pictureChecked, setPictureChecked] = useState(false);
  const [startedAt, setStartedAt] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ questions: [], given: [] });
  const [sender, setSender] = useState<Sender>(() => ({ as: getIdentity(), name: getSavedIdentity().name, contact: getSavedIdentity().contact, share: false }));
  const [preview, setPreview] = useState<Preview | null>(null);
  const [sent, setSent] = useState<{ proofId: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The words save on this device while the person works.
  useEffect(() => {
    if (step === "done") return;
    const t = window.setTimeout(() => saveDraft(challenge.id, { answer: parts.main, explain: [], startedAt }), 300);
    return () => window.clearTimeout(t);
  }, [challenge.id, parts.main, startedAt, step]);

  const go = useCallback((next: Step) => {
    setError(null);
    if (ORDER.indexOf(next) < ORDER.indexOf("preview")) setPreview(null);
    setStep(next);
    window.scrollTo({ top: 0 });
  }, []);

  useFlowHistory(step, (popped) => {
    const next = popped as Step;
    if (sent) return router.replace(`/my-work/${sent.proofId}`);
    if (ORDER.indexOf(next) <= ORDER.indexOf("work") || (next === "questions" && answers.questions.length) || next === "you") go(next === "intro" ? "work" : next);
  });

  const inFlight = useRef(false);
  async function run(action: () => Promise<void>) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(sendErrorLine(e));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  const answer = composeAnswer(challenge.format, parts, challenge.options) || (picture ? "A picture of my work." : "");
  const personaName = persona?.full ?? "";
  const sendName = sender.as === "persona" ? personaName : sender.name.trim();
  const sendContact = sender.as === "persona" ? personaContact(personaName) : sender.contact.trim();

  const begin = () => {
    setStartedAt((t) => t || Date.now());
    go("work");
  };

  if (step === "intro") {
    return (
      <Screen back={{ href: "/seeker" }}>
        <ThinkAloudIntro
          heading={<ChallengeHeading challenge={challenge} company={company} />}
          canScreen={canCaptureScreen()}
          busy={think.state.status === "asking"}
          error={think.state.status === "error" ? think.state.reason : undefined}
          onStart={async (wantScreen) => {
            await think.start(wantScreen);
            begin();
          }}
          onType={() => {
            think.typeInstead();
            begin();
          }}
        />
      </Screen>
    );
  }

  if (step === "work") {
    // A refused microphone sends the person back to the intro, which says why and offers typing.
    if (think.state.status === "error" || think.state.status === "idle") {
      return (
        <Screen back={{ href: "/seeker" }}>
          <ThinkAloudIntro
            heading={<ChallengeHeading challenge={challenge} company={company} />}
            canScreen={canCaptureScreen()}
            busy={false}
            error={think.state.status === "error" ? think.state.reason : undefined}
            onStart={(wantScreen) => void think.start(wantScreen)}
            onType={think.typeInstead}
          />
        </Screen>
      );
    }
    const ready = workReady(challenge.format, parts) || (Boolean(picture) && pictureChecked);
    const typing = think.state.status !== "asking" && (!think.listening || ("capture" in think.state && think.state.capture === "typed"));
    const status = think.state.status === "stopped" ? "stopped" : think.state.status === "paused" ? "paused" : "recording";
    return (
      <SessionView
        challenge={challenge}
        timer={<TimeRing minutes={challenge.minutes} startedAt={startedAt} />}
        pill={
          <RecorderPill
            status={status}
            seconds={think.seconds}
            level={think.level}
            heard={think.transcript}
            typed={"capture" in think.state && think.state.capture === "typed"}
            onPause={think.pause}
            onResume={think.resume}
            onStop={() => void think.stop()}
          />
        }
        aside={
          typing ? (
            <TypedThoughts value={think.typed} onChange={think.setTyped} />
          ) : (
            <p className="text-body text-pretty text-label-2">{think.screenNote ? `${think.screenNote} ` : ""}The recording stays on this device. The company gets the words as text.</p>
          )
        }
        action={
          <div className="flex flex-col gap-1.5">
            <Button
              disabled={!ready}
              loading={busy}
              className="h-14! text-[18px]!"
              onClick={() =>
                run(async () => {
                  if (isLive(think.state)) await think.stop();
                  const known = sender.as === "me" && sender.name.trim() ? { name: sender.name.trim(), contact: sender.contact.trim() } : undefined;
                  const issued = await api.followups(challenge.id, answer, known);
                  setAnswers({ questions: issued.questions, given: issued.questions.map(() => ({ answer: "", spoken: false })) });
                  go("questions");
                })
              }
            >
              I&apos;m done
            </Button>
            {error ? <p role="alert" className="text-footnote text-center text-label-2">{error}</p> : !ready ? <p className="text-footnote text-center text-label-2">{notReadyLine(challenge)}</p> : null}
          </div>
        }
      >
        <WorkArea
          challenge={challenge}
          parts={parts}
          onParts={(patch) => setParts((p) => ({ ...p, ...patch }))}
          mark={mark}
          onMark={setMark}
          picture={picture}
          onPicture={setPicture}
          pictureChecked={pictureChecked}
          onPictureChecked={setPictureChecked}
        />
      </SessionView>
    );
  }

  const back = () => backInFlow(() => go(ORDER[ORDER.indexOf(step) - 1] ?? "work"));

  if (step === "questions") {
    return <QuestionsStep answers={answers} onAnswers={setAnswers} onBack={back} onNext={() => go("you")} />;
  }

  if (step === "you") {
    return (
      <YouStep
        sender={sender}
        onSender={setSender}
        personaFirst={persona?.first ?? "Olena"}
        personaLine={`${sendName || personaName} · ${sendContact}`}
        company={company}
        busy={busy}
        error={error}
        onBack={back}
        onNext={() =>
          run(async () => {
            const explain = answers.questions.map((question, i) => ({ question, answer: answers.given[i]?.answer.trim() ?? "" }));
            const transcript = transcriptToSend(think.transcript);
            // The think-aloud runs through the same blind layer as the answer, as its own text.
            const [work, said] = await Promise.all([
              api.preview({ answer, explain, name: sendName, contact: sendContact }),
              transcript ? api.preview({ answer: transcript, explain: [], name: sendName, contact: sendContact }) : Promise.resolve(null),
            ]);
            setPreview({ work: work.work, explain: work.explain, transcript: said?.work ?? "", original: answer, originalTranscript: transcript, hiddenCount: work.hiddenCount, transcriptHidden: said?.hiddenCount ?? 0 });
            go("preview");
          })
        }
      />
    );
  }

  if (step === "preview" && preview) {
    return (
      <PreviewStep
        preview={preview}
        busy={busy}
        error={error}
        onBack={back}
        onEdit={() => go("work")}
        onSend={() =>
          run(async () => {
            const talentId = sender.as === "persona" ? (await api.demoSession()).persona.talentId : getTalentId();
            if (sender.as === "me") saveIdentity(sendName, sendContact);
            const transcript = transcriptToSend(think.transcript);
            const input = {
              challengeId: challenge.id,
              talent: { id: talentId, name: sendName, contact: sendContact },
              answer,
              explain: answers.questions.map((question, i) => ({ question, answer: answers.given[i]?.answer.trim() ?? "", ...(answers.given[i]?.spoken ? { spoken: true } : {}) })),
              ...(picture && pictureChecked
                ? { attachment: { kind: challenge.proofKind === "design" ? ("design" as const) : ("photo" as const), src: picture, alt: parts.main.trim() || "A picture of the work", confirmed: true as const } }
                : {}),
              shareWithSimilar: sender.share,
              ...(parts.choice ? { choice: parts.choice } : {}),
              ...(transcript ? { thinkAloud: { transcript, seconds: Math.round(think.seconds) } } : {}),
            };
            const res = await api.submit(input);
            think.keepFor(res.proof.proofId);
            clearDraft(challenge.id);
            setSent({ proofId: res.proof.proofId });
            go("done");
          })
        }
      />
    );
  }

  if (step === "done" && sent) return <DoneStep company={company} proofId={sent.proofId} replay={think.replay} />;
  return null;
}

/** A refusal the server explains, in plain words; "already answered" points to My work. */
function sendErrorLine(e: unknown): string {
  if (e instanceof ApiError && e.status === 409 && /already answered/i.test(e.message)) return "You already did this challenge. See it in My work.";
  return e instanceof ApiError && (e.status === 409 || e.status === 400) ? e.message : errorText(e);
}

/** "Write your work to go on." in the words of each format. */
function notReadyLine(challenge: Challenge): string {
  switch (challenge.format) {
    case "choose":
      return "Pick A or B to go on.";
    case "fix":
      return "Mark what is wrong and write the fix.";
    case "read":
      return "Write the one thing, in 240 characters or less.";
    case "make":
      return "Write your work, or add a picture, to go on.";
  }
}

/** The demo person's contact: invented, on the reserved example domain. */
function personaContact(fullName: string) {
  return `${fullName.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "")}@example.org`;
}

function ChallengeHeading({ challenge, company }: { challenge: Challenge; company: string }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-label-2">
        <FormatIcon format={challenge.format} />
        <span className="text-body font-medium">
          {FORMAT_LABEL[challenge.format]} · {challenge.minutes} min · {company}
        </span>
      </p>
      <p className="mt-2 text-[24px] leading-[30px] font-semibold text-pretty text-label">{challenge.title}</p>
    </div>
  );
}

/** Where the person types what they would say, when the browser cannot listen or they chose to type. */
function TypedThoughts({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="sr-only">Type what you would say</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        maxLength={6000}
        placeholder="Type what you would say while you work"
        data-tour="typed-thoughts"
        className="w-full resize-none rounded-inner bg-fill px-4 py-3 text-[17px] leading-[24px] text-label caret-accent outline-none placeholder:text-label-2 focus:shadow-[inset_0_0_0_1.5px_var(--color-label-3)]"
      />
    </label>
  );
}

/**
 * A sample session for the guided demo, from a seeded piece of work on this challenge: its think-aloud
 * and its answer, played on the same work screen. No microphone needed.
 */
function DemoRun({ challenge, onExit }: { challenge: Challenge; onExit: () => void }) {
  const { data: script, loading } = useResource(async () => {
    const top = await companyApi.top(challenge.companyIds[0], challenge.id);
    const seeded = [...top.scored.map((s) => s.proof), ...top.waiting].find((p) => p.thinkAloud?.transcript);
    return seeded ? scriptFromProof(challenge, seeded) : null;
  }, [challenge]);
  if (!script) {
    return (
      <Screen back={{ onBack: onExit }}>
        {loading ? <Skeleton className="mt-6 h-8 w-64" /> : <p className="text-body mt-6 text-label">No sample session for this challenge yet. Try it yourself.</p>}
      </Screen>
    );
  }
  return <DemoPlayer challenge={challenge} script={script} onExit={onExit} />;
}

function DemoPlayer({ challenge, script, onExit }: { challenge: Challenge; script: DemoScript; onExit: () => void }) {
  const frame = useDemoSession(script);
  const units = useMemo(() => (challenge.material ? fixUnits(challenge.material) : []), [challenge.material]);
  if (!frame) return null;
  const markUnit = frame.marked === null ? undefined : units[frame.marked];
  const parts: WorkParts = {
    choice: frame.picked ?? undefined,
    marked: markUnit ? markedText(units, markUnit) : undefined,
    main: script.answer.slice(0, frame.typed),
  };
  const heard = firstWords(script.transcript, frame.words);
  return (
    <>
      <SessionView
        challenge={challenge}
        sample
        timer={<TimeRing minutes={challenge.minutes} startedAt={0} at={frame.clock} />}
        pill={<RecorderPill status={frame.done ? "stopped" : "recording"} seconds={frame.clock} level={0.35 + 0.3 * Math.abs(Math.sin(frame.progress * 60))} heard={heard} sample />}
        aside={<p className="text-body line-clamp-2 text-pretty text-label">{heard ? `“${heard}”` : "A sample session. The words stream as they were said."}</p>}
        action={
          <Button onClick={onExit} variant={frame.done ? "primary" : "secondary"} className="h-14! text-[18px]!">
            {frame.done ? "Now try it yourself" : "Skip the sample"}
          </Button>
        }
      >
        <WorkArea
          challenge={challenge}
          parts={parts}
          onParts={() => {}}
          mark={frame.marked}
          onMark={() => {}}
          picture={null}
          onPicture={() => {}}
          pictureChecked={false}
          onPictureChecked={() => {}}
          locked
        />
      </SessionView>
      <DemoCursor frame={frame} mark={script.mark} />
    </>
  );
}
