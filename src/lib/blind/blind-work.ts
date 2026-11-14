import type { ExplainAnswer, RedactionReport } from "@/lib/domain/types";
import { addReports, redact, type KnownIdentity } from "./redact";

export interface BlindWork {
  work: string;
  explain: ExplainAnswer[];
  report: RedactionReport;
}

/** Runs the blind layer over every text a submission carries: the answer, the questions and the explain answers. */
export function blindWork(answer: string, explain: ExplainAnswer[], known: KnownIdentity): BlindWork {
  const work = redact(answer, known);
  let report = work.report;
  const blindExplain = explain.map(({ question, answer: text }) => {
    const q = redact(question, known);
    const a = redact(text, known);
    report = addReports(report, addReports(q.report, a.report));
    return { question: q.text, answer: a.text };
  });
  return { work: work.text, explain: blindExplain, report };
}
