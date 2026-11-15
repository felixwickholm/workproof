import type { Metadata } from "next";
import { pageMeta } from "@/app/page-meta";
import { MyWorkList } from "./my-work-list";

export const metadata: Metadata = pageMeta({ title: "My work", description: "The job seeker's own work: what was hidden, the reviewer's scores and reason, invitations, and a portfolio to share.", path: "/my-work" });

export default function MyWorkPage() {
  return <MyWorkList />;
}
