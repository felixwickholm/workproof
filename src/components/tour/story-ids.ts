import { companyName } from "@/lib/seed/companies";
import { STORY_CHALLENGE_ID, STORY_COMPANY_ID, STORY_PROOF_ID, STORY_REVIEWER } from "@/lib/seed/story";

/** The story the tours follow, read from the seed so they never name what the demo world dropped. */
export const STORY_CHALLENGE = STORY_CHALLENGE_ID;
export const STORY_COMPANY = STORY_COMPANY_ID;
export const STORY_PROOF_SEED = STORY_PROOF_ID;

/** The story company's name, which the lit invitation must say (the page can show two). */
export const storyCompanyName = () => companyName(STORY_COMPANY);

/** The first name of the person who scores the story work, for the chip "{name}, the boss". */
export const storyBossFirstName = () => STORY_REVIEWER.split(/\s+/)[0] || null;
