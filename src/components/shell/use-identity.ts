"use client";

import { useCompanyId, useReviewer } from "../company/company-choice";
import { companyName } from "@/lib/seed/companies";
import { accountFor } from "./identity";
import type { Account, Mode } from "./modes";

/** The account a mode shows, live: switching company in Hiring mode updates the account card at once. */
export function useAccount(mode: Mode): Account {
  const [companyId] = useCompanyId();
  const reviewer = useReviewer(companyId);
  return accountFor(mode, { reviewer, company: companyName(companyId) });
}
