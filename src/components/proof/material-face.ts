/**
 * A tab, or two or more spaces between words: columns lined up by hand, as in a small plan table.
 * Two spaces after a full stop are an old typing habit, not a column.
 */
const ALIGNED = /\t|[^\s.!?] {2,}\S/;

/**
 * True when a text block lines its columns up with tabs or runs of spaces. Those columns only
 * stay lined up in a fixed-width face; ordinary prose keeps the sans face.
 */
export function needsFixedWidth(body: string): boolean {
  return ALIGNED.test(body);
}
