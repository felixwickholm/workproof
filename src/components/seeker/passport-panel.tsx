"use client";

import { useState } from "react";
import { Panel } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { PassportEntry } from "@/lib/domain/types";
import { BigButton } from "./gated-action";
import { PassDetail } from "./pass-detail";
import type { PassOwners } from "./pass-face";
import { PassStack } from "./pass-stack";

interface Props {
  /** Newest first, as the API sends them. */
  passport: PassportEntry[];
  ownersOf: (entry: PassportEntry) => PassOwners;
  reviewerOf: (proofId: string, companyName: string) => string | undefined;
}

/** Oldest at the back of the stack; until a pass is chosen, the newest sits in front. */
export function usePassStack(passport: PassportEntry[]) {
  const entries = [...passport].reverse();
  const [chosen, setChosen] = useState<string | null>(null);
  const found = entries.findIndex((e) => e.proof.proofId === chosen);
  const front = found >= 0 ? found : entries.length - 1;
  return { entries, front, open: entries[front], setFront: (i: number) => setChosen(entries[i]?.proof.proofId ?? null) };
}

/** The empty passport: one way forward. */
export function NoPasses() {
  return (
    <EmptyState action={<BigButton href="/challenges">Do a task</BigButton>}>
      No proofs yet. Do a 20-minute task. A person at the company reads it without your name and decides, always with a written reason.
    </EmptyState>
  );
}

/** "Your passport" on the home: the wallet stack, and on a laptop the pass in front read beside it. */
export function PassportPanel({ passport, ownersOf, reviewerOf }: Props) {
  const { entries, front, open, setFront } = usePassStack(passport);

  return (
    <Panel title="Your passport" count={passport.length} href="/passport" linkLabel="Open passport">
      {open ? (
        <div className="grid grid-cols-1 gap-x-10 gap-y-5 min-[900px]:grid-cols-[minmax(0,6fr)_minmax(0,6fr)]">
          <PassStack entries={entries} front={front} onFront={setFront} ownersOf={ownersOf} />
          <div className="hidden min-[900px]:block">
            <PassDetail entry={open} owners={ownersOf(open)} reviewerOf={(company) => reviewerOf(open.proof.proofId, company)} />
          </div>
        </div>
      ) : (
        <NoPasses />
      )}
    </Panel>
  );
}
