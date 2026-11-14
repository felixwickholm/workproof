"use client";

import { useState, type ReactNode } from "react";
import { useCompanyId } from "@/components/company/company-choice";
import { companyErrorText } from "@/components/company/format";
import { StepSlide } from "@/components/step-slide";
import { Screen } from "@/components/ui/screen";
import { StepProgress } from "@/components/ui/step-progress";
import { api, companyApi } from "@/lib/client/api";
import { useResource } from "@/lib/client/use-resource";
import type { Challenge, ChallengeDraft } from "@/lib/domain/types";
import { draftStep } from "./draft-step";
import { needStep } from "./need-step";
import { liveStep } from "./live-step";

type Step = "need" | "draft" | "live";
const order: Step[] = ["need", "draft", "live"];

export function IntakeFlow() {
  const [step, setStep] = useState<Step>("need");
  const [direction, setDirection] = useState<1 | -1>(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [need, setNeed] = useState("");
  const [draft, setDraft] = useState<ChallengeDraft | null>(null);
  /** The need the current draft was made from, so going back and forward keeps the edits. */
  const [draftFor, setDraftFor] = useState("");
  const [approvedBy, setApprovedBy] = useState("");
  const [published, setPublished] = useState<Challenge | null>(null);

  const [companyId, setCompanyId] = useCompanyId();
  const companies = useResource(() => api.companies(), []);
  const company = companies.data?.find((c) => c.id === companyId) ?? companies.data?.[0];

  const go = (next: Step) => {
    setDirection(order.indexOf(next) > order.indexOf(step) ? 1 : -1);
    setError(null);
    setStep(next);
    window.scrollTo({ top: 0 });
  };

  async function run(action: () => Promise<void>) {
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
        setDraft(await companyApi.draft(text));
        setDraftFor(text);
      }
      go("draft");
    });

  const publish = () =>
    run(async () => {
      if (!draft || !company) return;
      const challenge = await companyApi.publish({ draft, companyId: company.id, approvedBy: approvedBy.trim() });
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

  const errorLine = error ? (
    <p role="alert" className="text-footnote mb-3 text-center text-label-2">
      {error}
    </p>
  ) : null;

  let content: ReactNode = null;
  let bottom: ReactNode = null;

  if (step === "need") {
    ({ content, bottom } = needStep({
      need,
      onNeed: setNeed,
      companies: companies.data,
      companyId: company?.id ?? companyId,
      onCompany: setCompanyId,
      busy,
      errorLine,
      onSubmit: makeDraft,
    }));
  }

  if (step === "draft" && draft) {
    ({ content, bottom } = draftStep({
      draft,
      onDraft: setDraft,
      companyName: company?.name ?? "",
      approvedBy,
      onApprovedBy: setApprovedBy,
      busy,
      errorLine,
      onPublish: publish,
    }));
  }

  if (step === "live" && published) {
    ({ content, bottom } = liveStep({ challenge: published, companies: companies.data ?? [], onStartOver: startOver }));
  }

  const index = order.indexOf(step);
  const back = step === "need" ? { href: "/" } : step === "draft" ? { onBack: () => go("need") } : undefined;

  return (
    <Screen back={back} center={step === "live" ? null : <StepProgress total={2} current={index} />} bottom={bottom}>
      <StepSlide stepKey={step} direction={direction}>
        {content}
      </StepSlide>
    </Screen>
  );
}
