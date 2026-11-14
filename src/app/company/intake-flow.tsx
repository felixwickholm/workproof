"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { fallbackLine } from "@/components/company/ai-designer";
import { getReviewer, useCompanyId } from "@/components/company/company-choice";
import { companyErrorText } from "@/components/company/format";
import { useOnDemoReset } from "@/components/company/use-demo-reset";
import { StepSlide } from "@/components/step-slide";
import { cx } from "@/components/ui/cx";
import { Screen } from "@/components/ui/screen";
import { api, companyApi } from "@/lib/client/api";
import { backInFlow, useFlowHistory } from "@/lib/client/use-flow-history";
import { useResource } from "@/lib/client/use-resource";
import type { Challenge, ChallengeDraft } from "@/lib/domain/types";
import { DraftStep } from "./draft-step";
import { FlowProgress } from "./flow-progress";
import { LiveStep } from "./live-step";
import { NeedStep } from "./need-step";

type Step = "need" | "draft" | "live";
const order: Step[] = ["need", "draft", "live"];

const titles: Record<Step, { title: string; subtitle?: string }> = {
  need: { title: "New challenge", subtitle: "Paste your job ad. We draft a short challenge. You approve it." },
  draft: { title: "Check your challenge", subtitle: "Click any line to change it." },
  live: { title: "Your challenge is live" },
};

type Source = { kind: "ad"; url: string } | { kind: "need" };

/** New challenge: a job ad link or one sentence, the draft a person checks and approves, then live. */
export function IntakeFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("need");
  const [direction, setDirection] = useState<1 | -1>(1);
  const [busy, setBusy] = useState<"ad" | "need" | "publish" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [adUrl, setAdUrl] = useState("");
  const [need, setNeed] = useState("");
  const [draft, setDraft] = useState<ChallengeDraft | null>(null);
  const [source, setSource] = useState<Source>({ kind: "need" });
  /** Why the built-in designer wrote the draft, from the AI status read just before asking. */
  const [fallback, setFallback] = useState<string | null>(null);
  /** Null until the person types: then the company's own reviewer stands in. */
  const [approvedBy, setApprovedBy] = useState<string | null>(null);
  const [published, setPublished] = useState<Challenge | null>(null);

  const [companyId, setCompanyId] = useCompanyId();
  const companies = useResource(() => api.companies(), []);
  const company = companies.data?.find((c) => c.id === companyId) ?? companies.data?.[0];
  const approver = approvedBy ?? (company ? getReviewer(company.id) : "");

  const go = (next: Step) => {
    setDirection(order.indexOf(next) > order.indexOf(step) ? 1 : -1);
    setError(null);
    setStep(next);
    window.scrollTo({ top: 0 });
  };

  /** One request at a time: a double tap never sends twice. */
  async function run(kind: "ad" | "need" | "publish", action: () => Promise<void>) {
    if (busy) return;
    setBusy(kind);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(companyErrorText(e));
    } finally {
      setBusy(null);
    }
  }

  async function drafted(make: () => Promise<ChallengeDraft>, from: Source) {
    // Read first: a model paused before this request was never tried, which is not a failure of this draft.
    const before = await api.aiStatus().catch(() => null);
    const next = await make();
    setDraft(next);
    setSource(from);
    setFallback(fallbackLine(next.draftedBy, before));
    go("draft");
  }

  const fromAd = (url = adUrl) => run("ad", () => drafted(() => companyApi.fromAd(url.trim()), { kind: "ad", url: url.trim() }));
  const fromNeed = () => run("need", () => drafted(() => companyApi.draft(need.trim()), { kind: "need" }));

  const publish = () =>
    run("publish", async () => {
      if (!draft || !company) return;
      setPublished(await companyApi.publish({ draft, companyId: company.id, approvedBy: approver.trim() }));
      go("live");
    });

  const startOver = () => {
    setAdUrl("");
    setNeed("");
    setDraft(null);
    setPublished(null);
    go("need");
  };

  // A reset drops the challenge this flow published; start again on the fresh event.
  useOnDemoReset(() => {
    companies.reload();
    if (published) startOver();
  });

  const errorLine = error ? (
    <p role="alert" className="text-subhead mb-3 text-pretty text-label">
      {error}
    </p>
  ) : null;

  let content: ReactNode = null;
  if (step === "need") {
    content = (
      <NeedStep
        adUrl={adUrl}
        onAdUrl={setAdUrl}
        need={need}
        onNeed={setNeed}
        companies={companies.data}
        companyId={company?.id ?? companyId}
        onCompany={setCompanyId}
        busy={busy === "ad" || busy === "need" ? busy : null}
        errorLine={errorLine}
        onFromAd={(url) => void fromAd(url)}
        onFromNeed={() => void fromNeed()}
      />
    );
  }
  if (step === "draft" && draft) {
    content = (
      <DraftStep
        draft={draft}
        onDraft={setDraft}
        companyName={company?.name ?? ""}
        source={source}
        fallback={fallback}
        approvedBy={approver}
        onApprovedBy={setApprovedBy}
        busy={busy === "publish"}
        errorLine={errorLine}
        onPublish={() => void publish()}
      />
    );
  }
  if (step === "live" && published) content = <LiveStep challenge={published} companies={companies.data ?? []} onStartOver={startOver} />;

  // The browser's back and forward move between steps. A published challenge is not edited here again.
  useFlowHistory(step, (popped) => {
    const next = popped as Step;
    if (published && next !== "live") return router.replace("/employer");
    if (next === "need" || (next === "draft" && draft)) go(next);
  });

  const back = step === "need" ? { href: "/employer", label: "My challenges" } : step === "draft" ? { onBack: () => backInFlow(() => go("need")), label: "Back" } : undefined;
  const { title, subtitle } = titles[step];

  return (
    <div className={cx("min-[900px]:mx-auto", step === "draft" ? "min-[900px]:max-w-[880px]" : "min-[900px]:max-w-[768px]")}>
      <Screen page title={title} subtitle={subtitle} back={back} center={<FlowProgress step={order.indexOf(step) + 1} total={order.length} />}>
        <StepSlide stepKey={step} direction={direction}>
          {content}
        </StepSlide>
      </Screen>
    </div>
  );
}
