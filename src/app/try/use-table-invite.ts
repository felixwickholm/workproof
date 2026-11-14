"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client/api";
import { useResource } from "@/lib/client/use-resource";
import type { MyTableInvite } from "@/lib/domain/types";

/** An invitation shows on the phone within two seconds of the host sending it. */
const POLL_MS = 2000;

export type PhoneInvite = NonNullable<MyTableInvite["invite"]>;

/**
 * Watches the table for an invitation to the visitor's own practice proof, every 2 s while the
 * page is in view. It stops once one arrives: from then on only this person can change it.
 */
export function useTableInvite(proofId: string | null) {
  const [known, setKnown] = useState<{ proofId: string; invite: PhoneInvite } | null>(null);
  const invite = known && known.proofId === proofId ? known.invite : null;
  const watching = proofId !== null && invite === null;
  const mine = useResource(watching ? () => api.tableMine(proofId) : null, [proofId, watching], { pollMs: POLL_MS });

  // Keep the first answer the poll brings, so the card stays when the poll stops.
  const found = mine.data?.invite;
  if (watching && found) setKnown({ proofId, invite: found });

  // A short buzz where the phone can: the table just answered.
  const arrivedOpen = invite?.status === "invited";
  useEffect(() => {
    if (arrivedOpen) navigator.vibrate?.(30);
  }, [arrivedOpen]);

  async function answer(send: (id: string) => Promise<MyTableInvite>) {
    if (!proofId) return;
    const result = await send(proofId);
    if (result.invite) setKnown({ proofId, invite: result.invite });
  }

  return {
    invite,
    /** The first name goes to the server only here, with the person's yes. */
    accept: (firstName: string) => answer((id) => api.acceptTableInvite(id, firstName)),
    decline: () => answer((id) => api.declineTableInvite(id)),
  };
}
