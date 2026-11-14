"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "../ui/button";
import { cx } from "../ui/cx";
import { Sheet } from "../ui/sheet";

/** Copies with the clipboard API, or by selecting the text where that API is blocked. */
async function copyText(text: string, field: HTMLTextAreaElement | null): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    if (!field) return false;
    field.select();
    return document.execCommand("copy");
  }
}

interface Props {
  open: boolean;
  title: string;
  /** The text to copy. The person may edit it first. */
  text: string;
  onClose: () => void;
  /** Shown above the text, for example the draft the message is about. */
  children?: ReactNode;
}

/**
 * A ready text in a sheet, editable, with one action: copy it. WorkProof sends nothing; the city sends
 * the text from its own mail.
 */
export function CopySheet({ open, title, text, onClose, children }: Props) {
  const [value, setValue] = useState(text);
  const [shownFor, setShownFor] = useState(text);
  const [copied, setCopied] = useState<"yes" | "failed" | null>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  if (shownFor !== text) {
    setShownFor(text);
    setValue(text);
    setCopied(null);
  }

  useEffect(() => {
    if (copied !== "yes") return;
    const timer = window.setTimeout(() => setCopied(null), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => setCopied((await copyText(value, field.current)) ? "yes" : "failed");

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      {children}
      <label htmlFor="copy-text" className="text-footnote text-label-2">
        You can change the text.
      </label>
      <textarea
        id="copy-text"
        ref={field}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setCopied(null);
        }}
        rows={6}
        className="text-body mt-2 max-h-[40dvh] min-h-[140px] w-full resize-y field-sizing-content rounded-[16px] bg-surface px-4 py-3 text-label outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />
      <p className="text-footnote mt-3 text-pretty text-label-2">WorkProof does not send messages in this demo. Copy the text.</p>
      <div className="mt-5 flex flex-col gap-2 min-[480px]:flex-row-reverse">
        <Button onClick={copy} className="min-[480px]:w-auto min-[480px]:flex-1">
          {copied === "yes" ? <Check aria-hidden className="size-4" strokeWidth={1.75} /> : <Copy aria-hidden className="size-4" strokeWidth={1.75} />}
          {copied === "yes" ? "Copied" : "Copy text"}
        </Button>
        <Button variant="secondary" onClick={onClose} className="min-[480px]:w-auto min-[480px]:flex-1">
          Close
        </Button>
      </div>
      <p role="status" className={cx("text-footnote mt-2 text-label-2", copied !== "failed" && "sr-only")}>
        {copied === "yes" ? "Copied" : copied === "failed" ? "Copy did not work here. Select the text and copy it yourself." : ""}
      </p>
    </Sheet>
  );
}
