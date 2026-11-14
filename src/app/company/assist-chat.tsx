"use client";

import { ArrowUp, Mic } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { cx } from "@/components/ui/cx";
import { Spinner } from "@/components/ui/spinner";
import type { AssistMessage, AssistReply } from "@/lib/client/api";
import { LIMITS } from "@/lib/http/limits";

/** What a company can start from in one tap. Each one is a full first message. */
const STARTERS = [
  "Backend developer for our payments API",
  "An AI developer to find what we should automate first in our order handling",
  "Data analyst",
  "Customer service lead for a care home group",
] as const;

const OPENING = "Who are you looking for? Write a role, one sentence, or paste your job ad.";

interface Props {
  messages: AssistMessage[];
  /** The last question's answer choices, shown as chips under it. */
  choices: readonly string[];
  busy: boolean;
  onSend: (text: string) => void;
}

/**
 * The company's "new challenge" chat: the assistant asks who they need, at most two short questions,
 * then drafts. Text first; the mic only says that voice is coming.
 */
export function AssistChat({ messages, choices, busy, onSend }: Props) {
  const [text, setText] = useState("");
  const inputId = useId();
  const end = useRef<HTMLDivElement>(null);
  const started = messages.some((m) => m.from === "company");

  useEffect(() => {
    if (messages.length > 0) end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages.length, busy]);

  const send = (value = text) => {
    const clean = value.trim();
    if (clean.length < 2 || busy) return;
    onSend(clean);
    setText("");
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends; Shift+Enter keeps a new line for a pasted job ad.
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col">
      <ol aria-live="polite" aria-label="Chat with the challenge assistant" className="flex flex-col gap-3">
        <Bubble from="assistant">{OPENING}</Bubble>
        {messages.map((m, i) => (
          <Bubble key={i} from={m.from}>
            {m.text}
          </Bubble>
        ))}
        {busy ? (
          <li className="flex items-center gap-2 self-start rounded-[20px] rounded-bl-md bg-raised px-4 py-3 text-subhead text-label-2 shadow-[inset_0_0_0_1px_var(--color-separator)]">
            <Spinner />
            {started && !choices.length ? "Drafting your challenge" : "Thinking"}
          </li>
        ) : null}
      </ol>

      {!busy && choices.length > 0 ? (
        <ul aria-label="Quick answers" className="mt-3 flex flex-wrap justify-end gap-2">
          {choices.map((c) => (
            <li key={c}>
              <button type="button" onClick={() => send(c)} className="press text-subhead inline-flex min-h-11 items-center rounded-full bg-fill px-4 text-left font-medium text-label transition-colors duration-150 hover:bg-label/10">
                {c}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {!started && !busy ? (
        <div className="mt-4">
          <p className="text-footnote font-semibold tracking-wide text-label-2 uppercase">Try one</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <li key={s}>
                <button type="button" onClick={() => send(s)} className="press text-subhead inline-flex min-h-11 items-center rounded-full bg-fill px-4 text-left font-medium text-label transition-colors duration-150 hover:bg-label/10">
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div ref={end} />

      <form
        className="mt-5"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          Message to the challenge assistant
        </label>
        <div className="flex items-end gap-2 rounded-[26px] bg-raised p-1.5 pl-4 shadow-[inset_0_0_0_1px_var(--color-separator)] focus-within:shadow-[inset_0_0_0_1.5px_var(--color-label)]">
          <textarea
            id={inputId}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKey}
            rows={1}
            maxLength={LIMITS.assistText}
            placeholder={started ? "Your answer" : "For example: a backend developer for our payments API"}
            className="max-h-48 min-h-11 flex-1 resize-none bg-transparent py-2.5 text-[17px] leading-6 text-label outline-none [field-sizing:content] placeholder:text-label-3"
          />
          <button
            type="submit"
            aria-label="Send"
            aria-disabled={busy || text.trim().length < 2}
            className={cx(
              "press flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink transition-opacity duration-150",
              (busy || text.trim().length < 2) && "opacity-40",
            )}
          >
            <ArrowUp aria-hidden className="size-5" strokeWidth={2} />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 px-1">
          <p className="text-footnote text-pretty text-label-2">The AI drafts. You edit and approve. Nothing goes live before that.</p>
          <p className="text-footnote inline-flex shrink-0 items-center gap-1 text-label-3">
            <Mic aria-hidden className="size-3.5" strokeWidth={1.75} />
            Voice coming soon
          </p>
        </div>
      </form>
    </div>
  );
}

function Bubble({ from, children }: { from: AssistMessage["from"]; children: string }) {
  return (
    <li
      className={cx(
        "rise text-body max-w-[85%] rounded-[20px] px-4 py-3 text-pretty whitespace-pre-line",
        from === "assistant" ? "self-start rounded-bl-md bg-raised text-label shadow-[inset_0_0_0_1px_var(--color-separator)]" : "self-end rounded-br-md bg-label text-ground",
      )}
    >
      {children.length > 600 ? `${children.slice(0, 600).trimEnd()} …` : children}
    </li>
  );
}

export type { AssistReply };
