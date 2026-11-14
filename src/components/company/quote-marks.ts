/** A run of text, and whether it is one of the quotes software marked for a skill. */
interface MarkedRun {
  text: string;
  marked: boolean;
}

/**
 * Splits a text into runs, marking every place a quote appears. Quotes are matched as written,
 * longest first so a short quote inside a longer one never splits it. Overlaps keep the first match.
 */
export function markQuotes(text: string, quotes: readonly string[]): MarkedRun[] {
  const wanted = [...new Set(quotes.map((q) => q.trim()).filter((q) => q.length > 0))].sort((a, b) => b.length - a.length);
  const spans: [number, number][] = [];
  for (const quote of wanted) {
    let from = 0;
    for (let at = text.indexOf(quote, from); at !== -1; at = text.indexOf(quote, from)) {
      const end = at + quote.length;
      if (!spans.some(([s, e]) => at < e && end > s)) spans.push([at, end]);
      from = end;
    }
  }
  spans.sort((a, b) => a[0] - b[0]);
  const runs: MarkedRun[] = [];
  let cursor = 0;
  for (const [start, end] of spans) {
    if (start > cursor) runs.push({ text: text.slice(cursor, start), marked: false });
    runs.push({ text: text.slice(start, end), marked: true });
    cursor = end;
  }
  if (cursor < text.length) runs.push({ text: text.slice(cursor), marked: false });
  return runs;
}
