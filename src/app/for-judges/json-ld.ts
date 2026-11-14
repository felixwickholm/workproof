import { VERIFIED_ON } from "./evidence";
import { ENTRY, NAME, ONE_LINE, SUMMARY } from "./facts";

/**
 * schema.org data for / and /for-judges: the web app, its source code, and the hackathon entry.
 * Only fields that are true of the demo. Built from the same facts as /for-judges and /llms.txt.
 */
export function structuredData(origin: string, repo: string): Record<string, unknown> {
  const site = origin.replace(/\/$/, "");
  const code = repo.replace(/\/$/, "");
  const espoo = { "@type": "GovernmentOrganization", name: ENTRY.challengeBy, url: ENTRY.challengeByUrl };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${site}/#app`,
        name: NAME,
        description: SUMMARY,
        slogan: ONE_LINE,
        url: site,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web browser",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        license: "https://opensource.org/licenses/MIT",
        audience: { "@type": "Audience", audienceType: "Recruitment event organisers, hiring companies and professionals looking for work in Espoo" },
        sameAs: [code],
      },
      {
        "@type": "SoftwareSourceCode",
        "@id": `${code}#code`,
        name: NAME,
        codeRepository: code,
        programmingLanguage: "TypeScript",
        runtimePlatform: "Node.js 22",
        license: "https://opensource.org/licenses/MIT",
        targetProduct: { "@id": `${site}/#app` },
      },
      {
        "@type": "CreativeWork",
        "@id": `${site}/for-judges#entry`,
        name: `${NAME}: ${ENTRY.event} entry for the ${ENTRY.challengeBy} challenge "${ENTRY.challenge}"`,
        description: SUMMARY,
        url: `${site}/for-judges`,
        genre: "Hackathon entry",
        inLanguage: "en",
        dateCreated: ENTRY.firstCommit,
        dateModified: VERIFIED_ON,
        about: { "@id": `${site}/#app` },
        mentions: espoo,
        isBasedOn: code,
      },
      {
        "@type": "Event",
        name: ENTRY.event,
        startDate: ENTRY.eventStart,
        endDate: ENTRY.eventEnd,
        workFeatured: { "@id": `${site}/for-judges#entry` },
      },
    ],
  };
}

/** The data as script text that can never close its script element. */
export function jsonLdScript(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
