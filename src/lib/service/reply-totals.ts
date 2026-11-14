/**
 * The city's first question: did people get an answer, and how fast?
 * A proof counts as answered once any employer decided on it; the reply time is to that first decision.
 */
export function replyTotals(
  proofs: { proofId: string; submittedAt: string }[],
  decisions: { proofId: string; decidedAt: string }[],
): { proofsAnswered: number; medianHoursToFirstAnswer: number | null } {
  const first = new Map<string, number>();
  for (const d of decisions) {
    const at = new Date(d.decidedAt).getTime();
    const seen = first.get(d.proofId);
    if (seen === undefined || at < seen) first.set(d.proofId, at);
  }
  const hours = proofs.flatMap((p) => {
    const at = first.get(p.proofId);
    return at === undefined ? [] : [Math.max(0, (at - new Date(p.submittedAt).getTime()) / 3_600_000)];
  });
  return { proofsAnswered: hours.length, medianHoursToFirstAnswer: median(hours) };
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const value = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  return Math.round(value * 10) / 10;
}
