import type { Company, DecisionKind, ProofKind, Skill } from "@/lib/domain/types";
import { PROOF_KIND_LABEL } from "../ui/proof-kind";

/** "20 min · Plan": time first, because the time is what makes "a task, not a CV" obvious. */
export function taskMeta(minutes: number, kind: ProofKind): string {
  return `${minutes} min · ${PROOF_KIND_LABEL[kind]}`;
}

/** "about 3 h", "under an hour", "about 2 days". */
export function replyTime(hours: number): string {
  if (hours < 1) return "under an hour";
  if (hours < 48) return `about ${Math.round(hours)} h`;
  return `about ${Math.round(hours / 24)} days`;
}

/** "12 people answered · reply in about 3 h", or the half that is known, or null. */
export function answeredLine(proofsSent?: number, medianReplyHours?: number | null): string | null {
  const parts = [
    proofsSent ? `${proofsSent} ${proofsSent === 1 ? "person" : "people"} answered` : null,
    medianReplyHours != null ? `reply in ${replyTime(medianReplyHours)}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

/** "2 companies, one task" for a pooled task, otherwise null. */
export function pooledLine(companyCount: number): string | null {
  return companyCount > 1 ? `${companyCount} companies, one task` : null;
}

/** The first few skills to show, and how many more there are for a "+N" chip. */
export function clipSkills(skills: readonly Skill[], max = 3): { shown: Skill[]; more: number } {
  return { shown: skills.slice(0, max), more: Math.max(0, skills.length - max) };
}

/** "Kaari Home Care · Matinkylä", or "Saarnivo Grid and Kivira Labs" for a pooled task. */
export function companyLine(companies: readonly Company[]): string {
  if (companies.length === 1) return `${companies[0].name} · ${companies[0].district}`;
  return companies.map((c) => c.name).join(" and ");
}

/** The four plain facts a person asks before applying, in the employer's own terms. */
export function companyFacts(company: Company): { label: string; value: string }[] {
  const yesNo = (v: boolean) => (v ? "yes" : "no");
  return [
    { label: "Work language", value: company.workLanguage },
    { label: "Finnish needed", value: yesNo(company.finnishNeeded) },
    { label: "Helps with work permit", value: yesNo(company.permitSupport) },
    { label: "Helps with moving", value: yesNo(company.relocationHelp) },
  ];
}

/** A decision in words, as the person reads it. Never "rejected" or "passed". */
export function decisionWords(decision: DecisionKind): string {
  return decision === "meet" ? "wants to meet you" : "said not now, with a reason";
}

/** "7 details hidden before anyone read this". */
export function hiddenLine(count: number): string {
  if (count === 0) return "No personal details found to hide";
  return `${count} ${count === 1 ? "detail" : "details"} hidden before anyone read this`;
}

/** "Just now", "12 min ago", "3 h ago", "Yesterday", "4 days ago". */
export function timeAgo(iso: string, now: number): string {
  const minutes = Math.max(0, Math.floor((now - Date.parse(iso)) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

/** "0:30" for a clip length in seconds. */
export function clipLength(seconds: number): string {
  const s = Math.round(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
