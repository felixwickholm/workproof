import type { Talent } from "@/lib/domain/types";

/**
 * Stores who the person is. A taster may give only a first name, so it never locks identity.
 * The first event submission with both name and contact locks it: that is who a company may meet,
 * and no later request with the same id can change it. Before the lock, a later submission may replace both.
 */
export function rememberTalent(talents: Talent[], input: Pick<Talent, "id" | "name" | "contact">, isEvent: boolean): void {
  const name = input.name.trim();
  const contact = input.contact.trim();
  const locks = isEvent && Boolean(name && contact);
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
