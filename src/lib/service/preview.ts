import { blindWork } from "@/lib/blind/blind-work";
import type { ExplainAnswer, RedactionReport } from "@/lib/domain/types";
import { getStore } from "@/lib/store";

export interface PreviewInput {
  answer: string;
  explain: ExplainAnswer[];
  /** The author's own name and contact, so the preview hides them exactly as sending would. */
  name: string;
  contact: string;
}

/** What the company would read, before anything is sent. */
export interface BlindPreview {
  work: string;
  explain: ExplainAnswer[];
  hiddenCount: number;
}

function hiddenTotal(report: RedactionReport): number {
  return Object.values(report).reduce((sum, n) => sum + n, 0);
}

/**
 * The same blind layer a submission runs, over text that is not sent yet. Nothing is stored,
 * so the person can go back, remove what still shows who they are, and look again.
 */
export function blindPreview(input: PreviewInput, companies: string[]): BlindPreview {
  const blind = blindWork(input.answer, input.explain, { name: input.name, contact: input.contact, companies });
  return { work: blind.work, explain: blind.explain, hiddenCount: hiddenTotal(blind.report) };
}

/** Reads only the event's company names, which the blind layer hides too, then previews. */
export async function previewWork(input: PreviewInput): Promise<BlindPreview> {
  const snapshot = await getStore().read();
  return blindPreview(input, snapshot.companies.map((c) => c.name));
}
