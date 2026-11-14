"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { fallbackLine } from "@/components/company/ai-designer";
import { getReviewer, useCompanyId } from "@/components/company/company-choice";
import { companyErrorText } from "@/components/company/format";
import { handDraft, roleById, roleNeed } from "@/components/company/roles";
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
import { StartStep } from "./start-step";

type Step = "start" | "draft" | "live";
const order: Step[] = ["start", "draft", "live"];

const titles: Record<Step, { title: string; subtitle?: string }> = {
  start: { title: "New challenge", subtitle: "Say who you are looking for. The AI drafts a short challenge. You approve it." },
  draft: { title: "Check your challenge", subtitle: "Click any line to change it." },
  live: { title: "Your challenge is live" },
};

type Source = { kind: "ad"; url: string } | { kind: "role"; role: string } | { kind: "hand"; role: string };

/**
 * New challenge in three steps: who the company is looking for (or its job ad), the draft a named
 * person checks and approves, then live.
 */
export function IntakeFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("start");
  const [direction, setDirection] = useState<1 | -1>(1);
  const [busy, setBusy] = useState<"ad" | "role" | "publish" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [roleId, setRoleId] = useState<string | null>(null);
  const [words, setWords] = useState("");
  const [adUrl, setAdUrl] = useState("");
  const [draft, setDraft] = useState<ChallengeDraft | null>(null);
  const [source, setSource] = useState<Source>({ kind: "hand", role: "" });
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
  async function run(kind: "ad" | "role" | "publish", action: () => Promise<void>) {
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
  const role = roleById(roleId);
  const fromRole = () => {
    // The role the company picked travels with the draft, so the challenge reaches people who chose that role.
    if (role) void run("role", () => drafted(async () => ({ ...(await companyApi.draft(roleNeed(role, words))), roles: [role.id] }), { kind: "role", role: role.label }));
  };
  /** No AI: a blank challenge with the role's skills, which the company writes itself. */
  const byHand = () => {
    if (!role || busy) return;
    setDraft(handDraft(role));
    setSource({ kind: "hand", role: role.label });
    setFallback(null);
    go("draft");
  };

  const publish = () =>
    run("publish", async () => {
      if (!draft || !company) return;
      setPublished(await companyApi.publish({ draft, companyId: company.id, approvedBy: approver.trim() }));
      go("live");
    });

  const startOver = () => {
    setAdUrl("");
    setWords("");
    setRoleId(null);
    setDraft(null);
    setPublished(null);
    go("start");
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
  if (step === "start") {
    content = (
      <StartStep
        roleId={roleId}
        onRole={setRoleId}
        words={words}
        onWords={setWords}
        adUrl={adUrl}
        onAdUrl={setAdUrl}
        companies={companies.data}
        companyId={company?.id ?? companyId}
        onCompany={setCompanyId}
        busy={busy === "ad" || busy === "role" ? busy : null}
        errorLine={errorLine}
        onFromRole={fromRole}
        onByHand={byHand}
        onFromAd={(url) => void fromAd(url)}
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
    if (next === "start" || (next === "draft" && draft)) go(next);
  });

  const back = step === "start" ? { href: "/employer", label: "My challenges" } : step === "draft" ? { onBack: () => backInFlow(() => go("start")), label: "Back" } : undefined;
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
