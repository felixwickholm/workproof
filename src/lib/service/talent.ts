import type { Talent } from "@/lib/domain/types";

/**
 * Stores who the person is, for event work only. A practice task keeps no identity on the server:
 * its name and contact are used once to hide them in the text and are never written here.
 * The first event submission with both name and contact locks identity: that is who a company may meet,
 * and no later request with the same id can change it. Before the lock, a later submission may replace both.
 */
export function rememberTalent(talents: Talent[], input: Pick<Talent, "id" | "name" | "contact">, isEvent: boolean): void {
  if (!isEvent) return;
  const name = input.name.trim();
  const contact = input.contact.trim();
  const locks = Boolean(name && contact);
  const talent = talents.find((t) => t.id === input.id);
  if (!talent) {
    talents.push({ id: input.id, name, contact, ...(locks ? { locked: true } : {}) });
    return;
  }
  if (talent.locked) return;
  if (name) talent.name = name;
  if (contact) talent.contact = contact;
  if (locks) talent.locked = true;
}
