"use client";

import { useCompanyId, useReviewer } from "../company/company-choice";
import { companyName, REVIEWER_AVATARS } from "@/lib/seed/companies";
import { accountFor } from "./identity";
import type { Account, Mode } from "./modes";

/** The account a mode shows, live: switching company in the Company view updates the account card at once. */
export function useAccount(mode: Mode): Account {
  const [companyId] = useCompanyId();
  const reviewer = useReviewer(companyId);
  // Only a registered company person has a picture; a name typed in the demo gets the neutral shape.
  const avatar = REVIEWER_AVATARS[reviewer.trim()];
  return accountFor(mode, { reviewer, company: companyName(companyId), avatar });
}
