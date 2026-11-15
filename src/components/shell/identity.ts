import { PEOPLE, PERSONA } from "@/lib/seed/people";
import type { Account, Mode } from "./modes";

/** The demo person's picture, when the seed gives one. The visitor sees it on their own account card only. */
function personaAvatar(): string | undefined {
  const person = PEOPLE[PERSONA];
  return "avatar" in person && typeof person.avatar === "string" ? person.avatar : undefined;
}

/**
 * Who the visitor acts as in a mode. The Company view follows the company chosen there: its reviewer, their
 * picture and the company's name, or the company alone when no one is named yet. The other modes are fixed;
 * the job seeker's own account shows their own picture.
 */
export function accountFor(mode: Mode, employer: { reviewer: string; company: string; avatar?: string }): Account {
  if (mode.id === "seeker") {
    const avatar = personaAvatar();
    return avatar ? { ...mode.account, avatar } : mode.account;
  }
  if (mode.id !== "employer") return mode.account;
  const reviewer = employer.reviewer.trim();
  if (!reviewer) return { name: employer.company, role: "Company" };
  return employer.avatar ? { name: reviewer, role: employer.company, avatar: employer.avatar } : { name: reviewer, role: employer.company };
}
