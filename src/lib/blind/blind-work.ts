import type { Attachment, ExplainAnswer, RedactionReport } from "@/lib/domain/types";
import { addReports, redact, type KnownIdentity } from "./redact";

interface BlindWork {
  work: string;
  explain: ExplainAnswer[];
  /** The attachment with its `alt` text through the blind layer. The picture itself is the work, never the person. */
  attachment?: Attachment;
  report: RedactionReport;
}

/** Runs the blind layer over every text a submission carries: the answer, the questions, the explain answers and the picture's description. */
export function blindWork(answer: string, explain: ExplainAnswer[], known: KnownIdentity, attachment?: Attachment): BlindWork {
  const work = redact(answer, known);
  let report = work.report;
  const blindExplain = explain.map(({ question, answer: text, spoken }) => {
    const q = redact(question, known);
    const a = redact(text, known);
    report = addReports(report, addReports(q.report, a.report));
    return { question: q.text, answer: a.text, ...(spoken ? { spoken } : {}) };
  });
  if (!attachment) return { work: work.text, explain: blindExplain, report };
  const alt = redact(attachment.alt, known);
  return { work: work.text, explain: blindExplain, attachment: { ...attachment, alt: alt.text }, report: addReports(report, alt.report) };
}
