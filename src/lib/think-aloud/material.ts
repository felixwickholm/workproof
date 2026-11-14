/**
 * A tab, or two or more spaces between words: columns lined up by hand, as in a small table.
 * Two spaces after a full stop are an old typing habit, not a column.
 */
const ALIGNED = /\t|[^\s.!?] {2,}\S/;
const CELL_GAP = /\t+| {2,}/;

export type MaterialBlock = { kind: "text"; text: string } | { kind: "table"; head: string[]; rows: string[][] };

/** "41 000", "12 %", "-3.5": a cell that reads as a number lines up on the right. */
export function isFigure(cell: string): boolean {
  return /^[-+−]?[\d\s.,]+\s?(%|€|EUR|h|min|s|kg)?$/.test(cell.trim()) && /\d/.test(cell);
}

/** A cell of a hand-aligned line and the characters it covers. */
interface PlacedCell {
  text: string;
  start: number;
  end: number;
}

/** Cells split at two or more spaces, with where each sits on the line. */
function placedCells(line: string): PlacedCell[] {
  return [...line.matchAll(/\S+(?: \S+)*/g)].map((m) => ({ text: m[0], start: m.index, end: m.index + m[0].length }));
}

/**
 * A row's cells under the heading each one overlaps most (or sits nearest), so a row with blank cells
 * keeps its figure in the right column: "Social ads ... 3 000" puts 3 000 under Total, not under Qty.
 * Null when two cells would share a heading; the row then falls back to plain order.
 */
function underHeadings(head: readonly PlacedCell[], cells: readonly PlacedCell[]): string[] | null {
  const row = Array<string>(head.length).fill("");
  for (const cell of cells) {
    let column = 0;
    let best = -Infinity;
    head.forEach((h, c) => {
      const overlap = Math.min(cell.end, h.end) - Math.max(cell.start, h.start);
      if (overlap > best) {
        best = overlap;
        column = c;
      }
    });
    if (row[column]) return null;
    row[column] = cell.text;
  }
  return row;
}

/** The lines of a table as equal-width rows of cells, the first being the head. */
function tableRows(lines: readonly string[]): string[][] {
  const inOrder = lines.map((line) => line.trim().split(CELL_GAP).map((c) => c.trim()));
  const width = Math.max(...inOrder.map((r) => r.length));
  const padded = inOrder.map((r) => [...r, ...Array<string>(width - r.length).fill("")]);
  // Columns by position only when spaces line them up and the head names every column.
  if (lines.some((line) => line.includes("\t")) || inOrder[0].length !== width) return padded;
  const head = placedCells(lines[0]);
  return lines.map((line, r) => (r === 0 ? padded[0] : (underHeadings(head, placedCells(line)) ?? padded[r])));
}

/**
 * Material text as blocks: runs of two or more lines with hand-aligned columns become a table
 * (first line as the head), everything else stays prose. A table then reads as a table at any width,
 * instead of wrapping inside a fixed-width face.
 */
export function materialBlocks(body: string): MaterialBlock[] {
  const blocks: MaterialBlock[] = [];
  const lines = body.split("\n");
  let i = 0;
  const pushText = (text: string) => {
    const last = blocks[blocks.length - 1];
    if (last?.kind === "text") last.text += `\n${text}`;
    else blocks.push({ kind: "text", text });
  };
  while (i < lines.length) {
    let end = i;
    while (end < lines.length && ALIGNED.test(lines[end].trim())) end++;
    if (end - i >= 2) {
      const [head, ...rows] = tableRows(lines.slice(i, end));
      blocks.push({ kind: "table", head, rows });
      i = end;
    } else {
      pushText(lines[i]);
      i++;
    }
  }
  return blocks
    .map((b) => (b.kind === "text" ? { ...b, text: b.text.replace(/^\n+|\n+$/g, "") } : b))
    .filter((b) => b.kind === "table" || b.text.trim().length > 0);
}
