/** Quotes the person's own answer back to them before a follow-up question. */
export function AnswerQuote({ text }: { text: string }) {
  return (
    <figure className="mb-6 rounded-inner bg-surface px-4 py-3">
      <figcaption className="text-footnote text-label-2">You wrote</figcaption>
      <blockquote className="text-subhead mt-1 line-clamp-4 whitespace-pre-wrap text-label text-pretty">{text}</blockquote>
    </figure>
  );
}
