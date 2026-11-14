/** Placeholders the blind layer leaves where it removed a personal detail. */
export const HIDDEN_TOKEN = /\[(?:hidden|name|contact|place|school|employer|personal detail)\]/g;

export interface Segment {
  text: string;
  /** True for a detail the blind layer removed from this span of the original. */
  hidden: boolean;
}

/**
 * Finds which spans of the original text the blind text replaced with a token, by walking both
 * strings between tokens: the text between two tokens is copied unchanged, so each hidden span
 * runs from the end of one copied piece to the start of the next. Adjacent tokens become one span.
 * When the blind text does not come from the original, the whole original is returned unmarked.
 */
export function markHidden(original: string, blind: string): Segment[] {
  // The copied pieces of the blind text; a token sits between every two of them.
  const pieces = blind.split(HIDDEN_TOKEN);
  const plain: Segment[] = [{ text: original, hidden: false }];
  if (pieces.length === 1) return original ? plain : [];
  if (!original.startsWith(pieces[0])) return plain;

  const segments: Segment[] = [];
  const push = (text: string, hidden: boolean) => {
    if (!text) return;
    const last = segments[segments.length - 1];
    if (last && last.hidden === hidden) last.text += text;
    else segments.push({ text, hidden });
  };

  push(pieces[0], false);
  let at = pieces[0].length;
  for (let i = 1; i < pieces.length; i++) {
    const piece = pieces[i];
    const isLast = i === pieces.length - 1;
    let next: number;
    if (isLast) {
      // The last piece is the tail of the original, wherever the hidden span before it ends.
      if (!original.endsWith(piece) || original.length - piece.length < at) return plain;
      next = original.length - piece.length;
    } else if (piece === "") {
      // Two tokens in a row: the next copied piece decides where the joint span ends.
      continue;
    } else {
      next = original.indexOf(piece, at);
      if (next < 0) return plain;
    }
    push(original.slice(at, next), true);
    push(piece, false);
    at = next + piece.length;
  }
  return segments;
}
