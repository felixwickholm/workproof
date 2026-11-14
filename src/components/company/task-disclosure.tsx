"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import type { Challenge } from "@/lib/domain/types";
import { Card, Eyebrow } from "../ui/card";
import { CodeBlock } from "../ui/code-block";
import { cx } from "../ui/cx";

/** The task as the person got it, folded away so the work comes first. */
export function TaskDisclosure({ challenge }: { challenge: Challenge }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="press flex min-h-14 w-full items-center gap-3 rounded-card bg-surface px-4 py-3 text-left transition-colors duration-150 active:bg-raised"
      >
        <span className="min-w-0 flex-1">
          <span className="text-footnote block text-label-2">The task they got</span>
          <span className="text-body block truncate">{challenge.title}</span>
        </span>
        <ChevronDown
          aria-hidden
          className={cx("size-5 shrink-0 text-label-3 transition-transform duration-200 ease-(--ease-out)", open && "rotate-180")}
          strokeWidth={2.2}
        />
      </button>
      {open ? (
        <div id={panelId} className="flex flex-col gap-4 pt-4">
          <p className="text-body whitespace-pre-wrap px-1 text-label-2 text-pretty">{challenge.brief}</p>
          {challenge.material ? (
            challenge.material.kind === "code" ? (
              <CodeBlock title={challenge.material.title} code={challenge.material.body} />
            ) : (
              <Card className="p-4">
                <p className="text-footnote font-medium text-label-2">{challenge.material.title}</p>
                <p className="text-body mt-2 whitespace-pre-wrap text-pretty">{challenge.material.body}</p>
              </Card>
            )
          ) : null}
          <div className="px-1">
            <Eyebrow>They were asked</Eyebrow>
            <p className="text-headline mt-2 font-semibold text-pretty">{challenge.deliverable}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
