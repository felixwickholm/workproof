import type { Metadata } from "next";
import { pageMeta } from "@/app/page-meta";
import { IntakeFlow } from "./intake-flow";

export const metadata: Metadata = pageMeta({ title: "New challenge", description: "A company turns a job-ad link or one sentence into a challenge with 3 to 5 core skills. The AI drafts it, and a person edits and approves it.", path: "/company" });

export default function CompanyPage() {
  return <IntakeFlow />;
}
