"use client";

import { useRouter } from "next/navigation";
import { useCallback, useId, useState, type ReactNode } from "react";
import { fallbackLine } from "@/components/company/ai-designer";
import { getReviewer, useCompanyId } from "@/components/company/company-choice";
import { answerWindowHours } from "@/components/company/employer-format";
import { companyErrorText } from "@/components/company/format";
import { useOnDemoReset } from "@/components/company/use-demo-reset";
import { StepSlide } from "@/components/step-slide";
import { cx } from "@/components/ui/cx";
import { Screen } from "@/components/ui/screen";
import { api, companyApi } from "@/lib/client/api";
import { backInFlow, useFlowHistory } from "@/lib/client/use-flow-history";
import { useResource } from "@/lib/client/use-resource";
import type { Challenge, ChallengeDraft } from "@/lib/domain/types";
import { DraftStep, PublishAction, publishWaitsFor } from "./draft-step";
import { FlowProgress } from "./flow-progress";
import { LiveActions, LiveStep } from "./live-step";
import { DraftAction, NeedStep, needReady } from "./need-step";

type Step = "need" | "draft" | "live";
const order: Step[] = ["need", "draft", "live"];

const titles: Record<Step, { title: string; subtitle: string }> = {
  need: { title: "What do you need this person to do?", subtitle: "One sentence is enough. Write it the way you would say it to a colleague." },
  draft: { title: "Check the task, then publish", subtitle: "Edit any line in place. The wishes about a person stay with you." },
  live: { title: "Live. Talent can start now.", subtitle: "Every answer arrives in your queue without a name, in the order it came. You decide who to meet." },
};

/** Post a task: the need in one sentence, the AI draft a person checks and approves, then live. */
export function IntakeFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("need");
  const [direction, setDirection] = useState<1 | -1>(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [need, setNeed] = useState("");
  const [draft, setDraft] = useState<ChallengeDraft | null>(null);
  /** The need the current draft was made from, so going back and forward keeps the edits. */
  const [draftFor, setDraftFor] = useState("");
  /** Why the built-in designer wrote the draft, from the AI status read just before asking. */
  const [fallback, setFallback] = useState<string | null>(null);
  /** The need whose wish sort has played, so it sorts with motion only the first time. */
  const [sortedFor, setSortedFor] = useState<string | null>(null);
  /** Null until the person types: then the company's own reviewer stands in. */
  const [approvedBy, setApprovedBy] = useState<string | null>(null);
  const [published, setPublished] = useState<Challenge | null>(null);

  const [companyId, setCompanyId] = useCompanyId();
  const companies = useResource(() => api.companies(), []);
  const company = companies.data?.find((c) => c.id === companyId) ?? companies.data?.[0];
  // The company's home carries the event, and with it the answer window the company accepts.
  const home = useResource(() => companyApi.home(companyId), [companyId]);
  const windowHours = home.data ? answerWindowHours(home.data.event) : null;
  const approver = approvedBy ?? (company ? getReviewer(company.id) : "");
  const phoneRuleId = useId();

  const go = (next: Step) => {
    setDirection(order.indexOf(next) > order.indexOf(step) ? 1 : -1);
    setError(null);
    setStep(next);
    window.scrollTo({ top: 0 });
  };

  /** One request at a time: a double tap never sends twice. */
  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(companyErrorText(e));
    } finally {
      setBusy(false);
    }
  }

  const makeDraft = () =>
    run(async () => {
      const text = need.trim();
      if (!draft || text !== draftFor) {
        // Read first: a model paused before this request was never tried, which is not a failure of this draft.
        const before = await api.aiStatus().catch(() => null);
        const next = await companyApi.draft(text);
        setDraft(next);
        setFallback(fallbackLine(next.draftedBy, before));
        setDraftFor(text);
      }
      go("draft");
    });

  const publish = () =>
    run(async () => {
      if (!draft || !company) return;
      const challenge = await companyApi.publish({ draft, companyId: company.id, approvedBy: approver.trim() });
      setPublished(challenge);
      go("live");
    });

  const startOver = () => {
    setNeed("");
    setDraft(null);
    setDraftFor("");
    setPublished(null);
    go("need");
  };

  // A reset drops the task this flow published; start again on the fresh event.
  useOnDemoReset(() => {
    companies.reload();
    if (published) startOver();
  });

  const onSorted = useCallback(() => setSortedFor(draftFor), [draftFor]);

  const errorLine = error ? (
    <p role="alert" className="text-footnote mb-3 text-label-2">
      {error}
    </p>
  ) : null;

  let content: ReactNode = null;
  let bottom: ReactNode = null;

  if (step === "need") {
    content = (
      <NeedStep
        need={need}
        onNeed={setNeed}
        companies={companies.data}
        companyId={company?.id ?? companyId}
        onCompany={setCompanyId}
        busy={busy}
        errorLine={errorLine}
        onSubmit={makeDraft}
      />
    );
    bottom = <DraftAction ready={needReady(need)} busy={busy} ruleId={phoneRuleId} errorLine={errorLine} onSubmit={makeDraft} />;
  }

  if (step === "draft" && draft) {
    content = (
      <DraftStep
        draft={draft}
        onDraft={setDraft}
        companyName={company?.name ?? ""}
        fallback={fallback}
        sortPlays={sortedFor !== draftFor}
        onSorted={onSorted}
        approvedBy={approver}
        onApprovedBy={setApprovedBy}
        windowHours={windowHours}
        busy={busy}
        errorLine={errorLine}
        onPublish={publish}
      />
    );
    bottom = <PublishAction waitingFor={publishWaitsFor(draft, approver)} windowHours={windowHours} busy={busy} errorLine={errorLine} onPublish={publish} />;
  }

  if (step === "live" && published) {
    content = <LiveStep challenge={published} companies={companies.data ?? []} onStartOver={startOver} />;
    bottom = <LiveActions onStartOver={startOver} />;
  }

  // The browser's back and forward move between steps. A published card is not edited here again.
  useFlowHistory(step, (popped) => {
    const next = popped as Step;
    if (published && next !== "live") return router.replace("/company/review");
    if (next === "need" || (next === "draft" && draft)) go(next);
  });

  const back = step === "need" ? { href: "/employer", label: "Home" } : step === "draft" ? { onBack: () => backInFlow(() => go("need")), label: "Your need" } : undefined;
  const { title, subtitle } = titles[step];

  return (
    // The question and the finished task read as one focused 720px column; the draft uses the full width.
    <div className={cx(step !== "draft" && "min-[900px]:mx-auto min-[900px]:max-w-[768px]")}>
      <Screen
        page
        greeting={step === "need"}
        title={title}
        subtitle={subtitle}
        back={back}
        center={<FlowProgress step={order.indexOf(step) + 1} total={order.length} />}
        bottom={bottom}
        tall
        phoneBar
      >
        <StepSlide stepKey={step} direction={direction}>
          {content}
        </StepSlide>
      </Screen>
    </div>
  );
}

