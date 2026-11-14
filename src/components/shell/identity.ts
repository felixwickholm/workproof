import type { Account, Mode } from "./modes";

/**
 * Who the visitor acts as in a mode. Hiring follows the company chosen there: its reviewer and its
 * name, or the company alone when no one is named yet. The other modes are fixed.
 */
export function accountFor(mode: Mode, employer: { reviewer: string; company: string }): Account {
  if (mode.id !== "employer") return mode.account;
  const reviewer = employer.reviewer.trim();
  return reviewer ? { name: reviewer, role: employer.company } : { name: employer.company, role: "Hiring" };
}
