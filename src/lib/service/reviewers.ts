import type { Company } from "@/lib/domain/types";
import { isListedReviewer, reviewerNameProblem } from "@/lib/domain/decision-rules";
import { getStore } from "@/lib/store";
import { MAX_REVIEWERS } from "./capacity";
import { appendAudit, findOrThrow, ServiceError } from "./support";

/** The people registered to decide for a company. The seed registers one for every company. */
export function companyReviewers(company: Company): string[] {
  return [...(company.reviewers ?? [])];
}

/** True when the name is one of the company's registered reviewers. */
export function isRegisteredReviewer(company: Company, name: string): boolean {
  return isListedReviewer(companyReviewers(company), name);
}

/** The company with its reviewer list filled in, for the screens that show who may decide. */
export function withReviewers(company: Company): Company {
  return { ...company, reviewers: companyReviewers(company) };
}

/**
 * Registers a person to decide for a company. An explicit step ("Add me as a reviewer"), never a side
 * effect of a decision, and logged. A name that is empty or reads as software is refused, and so is a
 * name past the demo's limit per company.
 */
export async function addReviewer(companyId: string, name: string): Promise<{ companyId: string; reviewers: string[] }> {
  const problem = reviewerNameProblem(name);
  if (problem) throw new ServiceError(400, problem);
  const person = name.trim().replace(/\s+/g, " ");
  return getStore().update((data) => {
    const company = findOrThrow(data.companies, (c) => c.id === companyId, "Company");
    const reviewers = companyReviewers(company);
    if (!isListedReviewer(reviewers, person)) {
      if (reviewers.length >= MAX_REVIEWERS) throw new ServiceError(429, `${company.name} has ${MAX_REVIEWERS} reviewers, the most this demo keeps.`);
      reviewers.push(person);
      appendAudit(data, { actor: "human", by: person, action: "Added a reviewer", detail: `${person} can now decide on proofs for ${company.name}.` });
    }
    company.reviewers = reviewers;
    return { companyId: company.id, reviewers: [...reviewers] };
  });
}
