/** A title as the end of a sentence: a full stop only when it has no closing mark of its own ("Who waits?"). */
export function endSentence(title: string): string {
  const text = title.trim();
  return /[.?!]$/.test(text) ? text : `${text}.`;
}
