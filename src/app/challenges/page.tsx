import type { Metadata } from "next";
import { pageMeta } from "@/app/page-meta";
import { ChallengeList } from "./challenge-list";

export const metadata: Metadata = pageMeta({ title: "Challenges", description: "Every open challenge at the demo Espoo Talent Day: short real tasks from Espoo companies in four formats, Choose, Make, Fix and Read, 8 to 30 minutes each.", path: "/challenges" });

export default function ChallengesPage() {
  return <ChallengeList />;
}
