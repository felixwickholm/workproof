import { EyeOff } from "lucide-react";
import { Fragment } from "react";

/** Placeholders the blind layer leaves where it removed a personal detail. */
const TOKEN = /\[(hidden|name|contact|place|school|employer|personal detail)\]/g;

/** Someone's written work, with each removed detail shown as a quiet "hidden" pill instead of raw brackets. */
export function WorkText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(TOKEN);
  // split() with one capture group alternates: text, token, text, token, ...
  return (
    <p className={className}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="hidden-token">
            <EyeOff aria-hidden className="size-3" strokeWidth={2} />
            hidden
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </p>
  );
}
